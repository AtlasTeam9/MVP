/* eslint-disable camelcase */
import useSessionStore from '../store/SessionStore'
import useDeviceStore from '../store/DeviceStore'
import useTreeStore from '../store/TreeStore'
import useResultStore from '../store/ResultStore'

import apiClient from '../infrastructure/api/AxiosApiClient'
import StateError from '../infrastructure/errors/StateError'
import { Node } from '../domain/Node'

import deviceService from './DeviceService'

import {
    applyAnswerTransition,
    clearLocalSessionState,
    createDeviceFromApiResponse,
    deleteRemoteSessionIfPresent,
    mapResultsToRequirementResults,
    postForwardAnswer,
    postGoBackAnswer,
    shouldUseGoBackFlow,
} from './sessionHelpers'

class SessionService {
    // Private helper method to set the current node from response or TreeStore
    #setCurrentNodeFromResponse(response, position) {
        if (response.current_node) {
            useSessionStore
                .getState()
                .setCurrentNode(Node.fromApi(position?.current_node_id, response.current_node))
            return
        }

        const nodeFromStore = useTreeStore
            .getState()
            .getNodeByTreeIndexAndNodeId(position.current_tree_index, position.current_node_id)

        if (nodeFromStore) {
            useSessionStore.getState().setCurrentNode(nodeFromStore)
        } else {
            useSessionStore
                .getState()
                .setCurrentNode(new Node(position.current_node_id, 'Loading question...'))
        }
    }

    #setSessionPositionFromResponse(position) {
        useSessionStore
            .getState()
            .setDevicePosition(
                position.current_asset_index,
                position.current_tree_index,
                position.current_node_id
            )
    }

    #syncCurrentNodeFromTree(currentTreeIndex, errorCode, errorMessage) {
        const { currentNode } = useSessionStore.getState()

        if (!currentNode?.id) {
            return
        }

        const nodeFromTree = useTreeStore
            .getState()
            .getNodeByTreeIndexAndNodeId(currentTreeIndex, currentNode.id)

        if (!nodeFromTree) {
            throw new StateError(errorMessage, {
                code: errorCode,
                context: { currentTreeIndex, nodeId: currentNode.id },
            })
        }

        useSessionStore.getState().setCurrentNode(nodeFromTree)
    }

    // Private method to initialize stores and return session data from API response
    #initializeSessionFromResponse(response) {
        const { session_id: sessionId, device, position } = response
        const deviceObj = createDeviceFromApiResponse(device)

        useSessionStore.getState().setSessionId(sessionId)
        useSessionStore.getState().setSessionUploaded(false)
        useDeviceStore.getState().setDevice(deviceObj)
        this.#setSessionPositionFromResponse(position)

        this.#setCurrentNodeFromResponse(response, position)

        return { sessionId, device: deviceObj, position }
    }

    // Create a new session by uploading a device file (JSON)
    async createSessionWithFile(file) {
        const formData = new FormData()
        formData.append('file', file)

        // API call to create a session with the uploaded file
        const response = await apiClient.post('/session/create_session_with_file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        return this.#initializeSessionFromResponse(response)
    }

    // Create a new session from a Device object (direct API call without file)
    async createSessionWithDevice(device) {
        const devicePayload = device.toDict()

        // API call to create a session with the device object directly
        const response = await apiClient.post('/session/create_session', devicePayload)

        return this.#initializeSessionFromResponse(response)
    }

    // Private helper to get the first node of a tree by index
    #getFirstNodeOfTree(treeIndex) {
        const node = useTreeStore.getState().getNodeByTreeIndexAndNodeId(treeIndex, 'node1')
        return node
    }

    // Private helper to handle next node in same tree
    #handleNextNodeSameTree(response) {
        const { current_asset_index, current_tree_index, next_node_id } = response

        const nextNode = useTreeStore
            .getState()
            .getNodeByTreeIndexAndNodeId(current_tree_index, next_node_id)

        if (!nextNode) {
            throw new StateError('Successive node not found in local state..', {
                code: 'TREE_NEXT_NODE_NOT_FOUND',
                context: { current_tree_index, next_node_id },
            })
        }

        useSessionStore
            .getState()
            .setDevicePosition(current_asset_index, current_tree_index, next_node_id)
        useSessionStore.getState().setCurrentNode(nextNode)
    }

    // Private helper to navigate to a node and update device position
    #navigateToNode(treeIndex, assetIndex, nodeId) {
        const nextNode = this.#getFirstNodeOfTree(treeIndex)
        if (!nextNode) {
            throw new StateError('First node of the tree not found in local state.', {
                code: 'TREE_FIRST_NODE_NOT_FOUND',
                context: { treeIndex, assetIndex, nodeId },
            })
        }
        useSessionStore.getState().setDevicePosition(assetIndex, treeIndex, nodeId)
        useSessionStore.getState().setCurrentNode(nextNode)
    }

    // Private helper to handle tree completion
    #handleTreeCompleted(response, previousAssetIndex) {
        if (response.session_finished) {
            const transformedResults = mapResultsToRequirementResults(response.results)
            useResultStore.getState().setResults(transformedResults)
            useSessionStore.getState().setTestFinished(true)
            return
        }

        const { current_asset_index, current_tree_index, next_node_id } = response
        const assetChanged = current_asset_index !== previousAssetIndex
        const nodeId = assetChanged ? next_node_id : 'node1'

        this.#navigateToNode(current_tree_index, current_asset_index, nodeId)
    }

    // Private helper to handle go_back response
    #handleGoBackResponse(response) {
        if (!response.found) {
            return
        }

        if (response.session_finished) {
            const transformedResults = mapResultsToRequirementResults(response.results)
            useResultStore.getState().setResults(transformedResults)
            useSessionStore.getState().setTestFinished(true)
            return
        }

        if (!response.node_id) {
            return
        }

        const nextNode = useTreeStore
            .getState()
            .getNodeByTreeIndexAndNodeId(response.current_tree_index, response.node_id)

        if (nextNode) {
            useSessionStore
                .getState()
                .setDevicePosition(
                    response.current_asset_index,
                    response.current_tree_index,
                    response.node_id
                )
            useSessionStore.getState().setCurrentNode(nextNode)
        }
    }

    // Answer the current question and move to the next node
    async sendAnswer(answer) {
        const { sessionId, currentAssetIndex, currentNode, currentTreeIndex } = {
            sessionId: useSessionStore.getState().sessionId,
            currentAssetIndex: useSessionStore.getState().currentAssetIndex,
            currentNode: useSessionStore.getState().currentNode,
            currentTreeIndex: useSessionStore.getState().currentTreeIndex,
        }

        applyAnswerTransition(useSessionStore, answer)

        if (shouldUseGoBackFlow(useSessionStore)) {
            const goBackResponse = await postGoBackAnswer(apiClient, sessionId, answer, {
                currentAssetIndex,
                currentNode,
                currentTreeIndex,
            })

            this.#handleGoBackResponse(goBackResponse)
            return
        }

        const forwardResponse = await postForwardAnswer(apiClient, sessionId, answer)

        if (forwardResponse.tree_completed) {
            this.#handleTreeCompleted(forwardResponse, currentAssetIndex)
            return
        }

        this.#handleNextNodeSameTree(forwardResponse)
    }

    // Go back to a previous node and change answer
    async previousStep() {
        useSessionStore.getState().goToPreviousNode()
        const { currentNode, currentTreeIndex } = useSessionStore.getState()

        if (currentNode?.id) {
            this.#syncCurrentNodeFromTree(
                currentTreeIndex,
                'TREE_PREVIOUS_NODE_NOT_FOUND',
                'Previous node not found in local state.'
            )
        }
    }

    // Go forward in the future history (if user went back previously)
    async forwardStep() {
        useSessionStore.getState().goToNextNode()
        const { currentNode, currentTreeIndex } = useSessionStore.getState()

        if (currentNode?.id) {
            this.#syncCurrentNodeFromTree(
                currentTreeIndex,
                'TREE_FORWARD_NODE_NOT_FOUND',
                'Next node not found in local state.'
            )
        }
    }

    // Load a previously saved session from a JSON file
    async loadSessionFromFile(file) {
        const formData = new FormData()
        formData.append('file', file)

        // API call to load session from file
        const response = await apiClient.post('/session/load_session_from_file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        // Set sessionId in SessionStore
        useSessionStore.getState().setSessionId(response.session_id)
        useSessionStore.getState().setSessionUploaded(true)

        // Create Device object from response data and set in DeviceStore
        const deviceObj = createDeviceFromApiResponse(response.device)
        useDeviceStore.getState().setDevice(deviceObj)

        // Import past history (previous answers) into SessionStore
        if (response.answer && response.answer.length > 0) {
            useSessionStore.getState().importPastHistory(response.answer)
        }

        // Set the device position based on where the session left off
        const { current_asset_index, current_tree_index, current_node_id } = response.position

        // Only set position if session is not finished
        // For finished sessions, position is invalid (asset_index out of bounds, node_id empty)
        // The position will be set when user selects asset in ModifySessionView
        if (!response.is_finished) {
            this.#setSessionPositionFromResponse({
                current_asset_index,
                current_tree_index,
                current_node_id,
            })

            // Load the current node from TreeStore using tree index and node ID
            this.#setCurrentNodeFromResponse(response, response.position)
        }

        // Transform aggregate_results to RequirementResult format and save to ResultStore
        const transformedResults = mapResultsToRequirementResults(response.aggregate_results)
        useResultStore.getState().setResults(transformedResults)

        // Save results per asset in SessionStore for detailed view
        if (response.results) {
            useSessionStore.getState().setResultsPerAsset(response.results)
        }

        // Set test finished status based on is_finished flag
        useSessionStore.getState().setTestFinished(response.is_finished)

        return { results: transformedResults, isFinished: response.is_finished }
    }

    // Delete session and clear stores (same behavior as HomeIcon)
    async saveAndExit() {
        try {
            await deleteRemoteSessionIfPresent(useSessionStore, apiClient)
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
        return pastHistory.map((item) => ({
            asset_index: item.assetIndex,
            tree_index: item.treeIndex,
            node_id: item.nodeId,
            answer: item.answer,
        }))
    }

    // Clear all session-related data from stores and delete session on backend
    async clearSession() {
        try {
            await deleteRemoteSessionIfPresent(useSessionStore, apiClient)
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

        const firstNode = this.#getFirstNodeOfTree(treeIndex)

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
