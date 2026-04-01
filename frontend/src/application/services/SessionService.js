/* eslint-disable camelcase */
import useSessionStore from '@state/SessionStore'
import useDeviceStore from '@state/DeviceStore'
import useTreeStore from '@state/TreeStore'
import useResultStore from '@state/ResultStore'

import { apiClientService } from '@application/services/AppServices'

import deviceService from '@application/services/DeviceService'

import {
    applyAnswerTransition,
    clearLocalSessionState,
    createDeviceFromApiResponse,
    deleteRemoteSessionIfPresent,
    mapLoadSessionResponse,
    mapResultsToRequirementResults,
    postForwardAnswer,
    postGoBackAnswer,
    shouldUseGoBackFlow,
    getFirstNodeOfTree,
    handleGoBackResponse,
    handleNextNodeSameTree,
    handleTreeCompleted,
    isPerAssetResults,
    navigateToNode,
    setCurrentNodeFromResponse,
    setPerAssetResultsFromExport,
    setSessionPositionFromResponse,
    syncCurrentNodeFromTree,
} from '@application/services/sessionHelpers'

class SessionService {
    // Private method to initialize stores and return session data from API response
    #initializeSessionFromResponse(response) {
        const { session_id: sessionId, device, position } = response
        const deviceObj = createDeviceFromApiResponse(device)

        useSessionStore.getState().setSessionId(sessionId)
        useSessionStore.getState().setSessionUploaded(false)
        useDeviceStore.getState().setDevice(deviceObj)
        setSessionPositionFromResponse(position, { useSessionStore })

        setCurrentNodeFromResponse(response, position, { useSessionStore, useTreeStore })

        return { sessionId, device: deviceObj, position }
    }

    // Create a new session by uploading a device file (JSON)
    async createSessionWithFile(file) {
        const formData = new FormData()
        formData.append('file', file)

        // API call to create a session with the uploaded file
        const response = await apiClientService.post('/session/create_session_with_file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        return this.#initializeSessionFromResponse(response)
    }

    // Create a new session from a Device object (direct API call without file)
    async createSessionWithDevice(device) {
        const devicePayload = device.toDict()

        // API call to create a session with the device object directly
        const response = await apiClientService.post('/session/create_session', devicePayload)

        return this.#initializeSessionFromResponse(response)
    }

    // Answer the current question and move to the next node
    async sendAnswer(answer) {
        const { sessionId, currentAssetIndex, currentNode, currentTreeIndex } = {
            sessionId: useSessionStore.getState().sessionId,
            currentAssetIndex: useSessionStore.getState().currentAssetIndex,
            currentNode: useSessionStore.getState().currentNode,
            currentTreeIndex: useSessionStore.getState().currentTreeIndex,
        }

        // Capture the flow before transition side effects clear future history and resume mode.
        const shouldGoBackFlow = shouldUseGoBackFlow(useSessionStore)

        applyAnswerTransition(useSessionStore, answer)

        if (shouldGoBackFlow) {
            const goBackResponse = await postGoBackAnswer(apiClientService, sessionId, answer, {
                currentAssetIndex,
                currentNode,
                currentTreeIndex,
            })

            await handleGoBackResponse(goBackResponse, {
                mapResultsToRequirementResults,
                useResultStore,
                useSessionStore,
                useTreeStore,
                isPerAssetResults,
                setPerAssetResultsFromExport,
                getFormattedAnswers: () => this.getFormattedAnswers(),
                apiClientService,
            })
            return
        }

        const forwardResponse = await postForwardAnswer(apiClientService, sessionId, answer)

        if (forwardResponse.tree_completed) {
            await handleTreeCompleted(forwardResponse, currentAssetIndex, {
                mapResultsToRequirementResults,
                useResultStore,
                useSessionStore,
                useTreeStore,
                isPerAssetResults,
                setPerAssetResultsFromExport,
                getFormattedAnswers: () => this.getFormattedAnswers(),
                apiClientService,
                navigateToNode,
            })
            return
        }

        handleNextNodeSameTree(forwardResponse, { useSessionStore, useTreeStore })
    }

    // Go back to a previous node and change answer
    async previousStep() {
        useSessionStore.getState().goToPreviousNode()
        const { currentNode, currentTreeIndex } = useSessionStore.getState()

        if (currentNode?.id) {
            syncCurrentNodeFromTree(
                currentTreeIndex,
                'TREE_PREVIOUS_NODE_NOT_FOUND',
                'Previous node not found in local state.',
                { useSessionStore, useTreeStore }
            )
        }
    }

    // Go forward in the future history (if user went back previously)
    async forwardStep() {
        useSessionStore.getState().goToNextNode()
        const { currentNode, currentTreeIndex } = useSessionStore.getState()

        if (currentNode?.id) {
            syncCurrentNodeFromTree(
                currentTreeIndex,
                'TREE_FORWARD_NODE_NOT_FOUND',
                'Next node not found in local state.',
                { useSessionStore, useTreeStore }
            )
        }
    }

    // Load a previously saved session from a JSON file
    async loadSessionFromFile(file) {
        const formData = new FormData()
        formData.append('file', file)

        // API call to load session from file
        const response = await apiClientService.post('/session/load_session_from_file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        const mappedResponse = mapLoadSessionResponse(response)

        // Set sessionId in SessionStore
        useSessionStore.getState().setSessionId(mappedResponse.sessionId)
        useSessionStore.getState().setSessionUploaded(true)

        // Create Device object from response data and set in DeviceStore
        useDeviceStore.getState().setDevice(mappedResponse.device)

        // Import past history (previous answers) into SessionStore
        if (mappedResponse.answers.length > 0) {
            useSessionStore.getState().importPastHistory(mappedResponse.answers)
        }

        // Set the device position based on where the session left off
        const { current_asset_index, current_tree_index, current_node_id } =
            mappedResponse.position || {}

        // Only set position if session is not finished
        // For finished sessions, position is invalid (asset_index out of bounds, node_id empty)
        // The position will be set when user selects asset in ModifySessionView
        if (!mappedResponse.isFinished && mappedResponse.position) {
            setSessionPositionFromResponse(
                {
                current_asset_index,
                current_tree_index,
                current_node_id,
                },
                { useSessionStore }
            )

            // Load the current node from TreeStore using tree index and node ID
            setCurrentNodeFromResponse(response, mappedResponse.position, {
                useSessionStore,
                useTreeStore,
            })
        }

        // Save transformed aggregate results in ResultStore
        useResultStore.getState().setResults(mappedResponse.results)

        // Save results per asset in SessionStore for detailed view
        if (mappedResponse.resultsPerAsset) {
            useSessionStore.getState().setResultsPerAsset(mappedResponse.resultsPerAsset)
        }

        // Set test finished status based on is_finished flag
        useSessionStore.getState().setTestFinished(mappedResponse.isFinished)

        return { results: mappedResponse.results, isFinished: mappedResponse.isFinished }
    }

    // Delete session and clear stores (same behavior as HomeIcon)
    async saveAndExit() {
        try {
            await deleteRemoteSessionIfPresent(useSessionStore, apiClientService)
        } catch {
            // Continue clearing local stores even if backend delete fails
        } finally {
            deviceService.clearDevice()
            clearLocalSessionState(useSessionStore, useResultStore)
        }
    }

    // Get the current session ID
    getSessionId() {
        return useSessionStore.getState().sessionId
    }

    // Get formatted answers from the session history for export
    getFormattedAnswers() {
        const { pastHistory } = useSessionStore.getState()
        const history = Array.isArray(pastHistory) ? pastHistory : []
        return history.map((item) => ({
            asset_index: item.assetIndex,
            tree_index: item.treeIndex,
            node_id: item.nodeId,
            answer: item.answer,
        }))
    }

    // Clear all session-related data from stores and delete session on backend
    async clearSession() {
        try {
            await deleteRemoteSessionIfPresent(useSessionStore, apiClientService)
        } catch {
            // Continue clearing local stores even if backend delete fails
        } finally {
            clearLocalSessionState(useSessionStore, useResultStore)
        }
    }

    resumeSession(requirementId, assetId) {
        const currentDevice = useDeviceStore.getState().currentDevice
        const trees = useTreeStore.getState().trees

        if (!assetId || !requirementId || !currentDevice || !trees) {
            return false
        }

        const assetIndex = currentDevice.assets.findIndex((asset) => asset.id === assetId)
        const treeIndex = trees.findIndex((tree) => tree.id === requirementId)

        if (assetIndex === -1 || treeIndex === -1) {
            return false
        }

        const firstNode = getFirstNodeOfTree(treeIndex, { useTreeStore })

        if (!firstNode) {
            return false
        }

        useSessionStore.getState().setDevicePosition(assetIndex, treeIndex, 'node1')
        useSessionStore.getState().setCurrentNode(firstNode)
        useSessionStore.getState().truncateHistoryByPosition(assetIndex, treeIndex)
        useSessionStore.getState().clearFuture()
        useSessionStore.getState().setResumeMode(true)
        useSessionStore.getState().setSessionUploaded(false)
        useSessionStore.getState().setTestFinished(false)

        return true
    }
}

// Exported as a singleton instance
export default new SessionService()


