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

    async createSessionWithFile(file) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await apiClientService.post('/session/create_session_with_file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        return this.#initializeSessionFromResponse(response)
    }

    async createSessionWithDevice(device) {
        const devicePayload = device.toDict()

        const response = await apiClientService.post('/session/create_session', devicePayload)

        return this.#initializeSessionFromResponse(response)
    }

    /**
     * Submits an answer and orchestrates navigation.
     * Uses go_back flow while resuming edited history; otherwise uses forward flow.
     */
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

    /**
     * Loads a persisted session payload and restores local stores.
     * Handles both unfinished and already finished sessions.
     */
    async loadSessionFromFile(file) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await apiClientService.post('/session/load_session_from_file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        const mappedResponse = mapLoadSessionResponse(response)

        useSessionStore.getState().setSessionId(mappedResponse.sessionId)
        useSessionStore.getState().setSessionUploaded(true)

        useDeviceStore.getState().setDevice(mappedResponse.device)

        if (mappedResponse.answers.length > 0) {
            useSessionStore.getState().importPastHistory(mappedResponse.answers)
        }

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

            setCurrentNodeFromResponse(response, mappedResponse.position, {
                useSessionStore,
                useTreeStore,
            })
        }

        useResultStore.getState().setResults(mappedResponse.results)

        if (mappedResponse.resultsPerAsset) {
            useSessionStore.getState().setResultsPerAsset(mappedResponse.resultsPerAsset)
        }

        useSessionStore.getState().setTestFinished(mappedResponse.isFinished)

        return { results: mappedResponse.results, isFinished: mappedResponse.isFinished }
    }

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

    getSessionId() {
        return useSessionStore.getState().sessionId
    }

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

    async clearSession() {
        try {
            await deleteRemoteSessionIfPresent(useSessionStore, apiClientService)
        } catch {
            // Continue clearing local stores even if backend delete fails
        } finally {
            clearLocalSessionState(useSessionStore, useResultStore)
        }
    }

    /**
     * Moves the session cursor to a specific requirement/asset pair.
     * Keeps only history that happened before that position.
     */
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

export default new SessionService()


