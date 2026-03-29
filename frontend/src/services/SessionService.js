/* eslint-disable camelcase */
import useSessionStore from '../store/SessionStore'
import useDeviceStore from '../store/DeviceStore'
import useTreeStore from '../store/TreeStore'
import useResultStore from '../store/ResultStore'
import apiClient from '../infrastructure/api/AxiosApiClient'
import deviceService from './DeviceService'
import Device from '../domain/Device'
import Asset from '../domain/Asset'
import StateError from '../infrastructure/errors/StateError'

class SessionService {
    // Private method to extract device data from API response and create a Device object
    #createDeviceFromResponse(deviceData) {
        // Convert asset dictionaries to Asset instances
        const assetInstances = (deviceData.assets || []).map(
            (asset) =>
                new Asset(asset.id, asset.name, asset.type, asset.is_sensitive, asset.description)
        )
        return new Device(
            deviceData.device_name,
            assetInstances,
            deviceData.operating_system,
            deviceData.firmware_version,
            deviceData.functionalities,
            deviceData.description
        )
    }

    // Private helper method to set the current node from response or TreeStore
    #setCurrentNodeFromResponse(response, position) {
        if (response.current_node) {
            useSessionStore.getState().setCurrentNode(response.current_node)
            return
        }

        const nodeFromStore = useTreeStore
            .getState()
            .getNodeByTreeIndexAndNodeId(position.current_tree_index, position.current_node_id)

        if (nodeFromStore) {
            useSessionStore.getState().setCurrentNode(nodeFromStore)
        } else {
            useSessionStore.getState().setCurrentNode({
                id: position.current_node_id,
                text: 'Loading question...',
            })
        }
    }

    // Private method to initialize stores and return session data from API response
    #initializeSessionFromResponse(response) {
        const { session_id: sessionId, device, position } = response
        const deviceObj = this.#createDeviceFromResponse(device)

        useSessionStore.getState().setSessionId(sessionId)
        useSessionStore.getState().setSessionUploaded(false)
        useDeviceStore.getState().setDevice(deviceObj)
        useSessionStore
            .getState()
            .setDevicePosition(
                position.current_asset_index,
                position.current_tree_index,
                position.current_node_id
            )

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

    // TODO: aspettare risposta bluewind
    resumeSession(requirementId, assetId) {
        void requirementId
        void assetId
        // TODO: Logica per riprendere una sessione specifica
    }

    importSessionFromFile(content) {
        void content
        // TODO: Validazione file JSON e popolamento dello store
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
            throw new StateError('Nodo successivo non trovato nello stato locale.', {
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
            throw new StateError('Nodo iniziale dell albero non trovato nello stato locale.', {
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
            // Transform backend results to RequirementResult format and save to store
            const transformedResults = this.#transformResultsToRequirementResults(response.results)
            useResultStore.getState().setResults(transformedResults)
            useSessionStore.getState().setTestFinished(true)
            return
        }

        const { current_asset_index, current_tree_index, next_node_id } = response
        const assetChanged = current_asset_index !== previousAssetIndex
        const nodeId = assetChanged ? next_node_id : 'node1'

        this.#navigateToNode(current_tree_index, current_asset_index, nodeId)
    }

    // Private helper to transform backend results into RequirementResult format
    #transformResultsToRequirementResults(backendResults) {
        // backendResults structure: {requirementId: status}
        // Example: {"ACM-1": "PASS", "ACM-2": "FAIL", ...}
        const results = []

        for (const [code, status] of Object.entries(backendResults)) {
            results.push({
                code: code,
                status: status,
            })
        }

        return results
    }

    // Private helper to handle go_back response
    #handleGoBackResponse(response) {
        if (!response.found) {
            return
        }

        if (response.session_finished) {
            const transformedResults = this.#transformResultsToRequirementResults(response.results)
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
        const sessionId = useSessionStore.getState().sessionId
        const currentAssetIndex = useSessionStore.getState().currentAssetIndex
        const currentNode = useSessionStore.getState().currentNode
        const currentTreeIndex = useSessionStore.getState().currentTreeIndex

        // Check if futureHistory is not empty, meaning user went back and is
        // answering a previous question, OR if we're in resume mode
        // (resuming from selected asset)
        const futureHistory = useSessionStore.getState().futureHistory
        const isResumeMode = useSessionStore.getState().isResumeMode
        const hasGoingBack = futureHistory.length > 0 || isResumeMode

        // Save the current question and answer to pastHistory
        useSessionStore.getState().selectAnswer(answer)

        // Clear future history since we're creating a new path by answering
        useSessionStore.getState().clearFuture()

        // Exit resume mode after first answer
        if (isResumeMode) {
            useSessionStore.getState().setResumeMode(false)
        }

        let response
        if (hasGoingBack) {
            // User went back and is changing a previous answer, OR resuming from selected asset
            // use go_back endpoint
            response = await apiClient.post(`/session/${sessionId}/go_back`, {
                target_asset_index: currentAssetIndex,
                target_node_id: currentNode?.id,
                target_tree_index: currentTreeIndex,
                new_answer: answer,
            })
            this.#handleGoBackResponse(response)
        } else {
            // Normal forward progression - use answer endpoint
            response = await apiClient.post(`/session/${sessionId}/answer`, {
                answer,
            })

            // Backend provides current position information:
            // current_asset_index, current_tree_index, next_node_id
            // This allows proper navigation when trees are skipped due to NA/FAIL results
            if (response.tree_completed) {
                this.#handleTreeCompleted(response, currentAssetIndex)
            } else {
                this.#handleNextNodeSameTree(response)
            }
        }
    }

    // Go back to a previous node and change answer
    async previousStep() {
        // Call the store's navigation method
        useSessionStore.getState().goToPreviousNode()

        // Get the updated state - goToPreviousNode has already set currentNode
        const { currentNode, currentTreeIndex } = useSessionStore.getState()

        // Fetch the full node data from TreeStore using the node ID and tree index
        if (currentNode && currentNode.id) {
            const nodeFromTree = useTreeStore
                .getState()
                .getNodeByTreeIndexAndNodeId(currentTreeIndex, currentNode.id)

            if (nodeFromTree) {
                useSessionStore.getState().setCurrentNode(nodeFromTree)
            } else {
                throw new StateError('Nodo precedente non trovato nello stato locale.', {
                    code: 'TREE_PREVIOUS_NODE_NOT_FOUND',
                    context: { currentTreeIndex, nodeId: currentNode.id },
                })
            }
        }
    }

    // Go forward in the future history (if user went back previously)
    async forwardStep() {
        // Call the store's navigation method
        useSessionStore.getState().goToNextNode()

        // Get the updated state - goToNextNode has already set currentNode
        const { currentNode, currentTreeIndex } = useSessionStore.getState()

        // Fetch the full node data from TreeStore using the node ID and tree index
        if (currentNode && currentNode.id) {
            const nodeFromTree = useTreeStore
                .getState()
                .getNodeByTreeIndexAndNodeId(currentTreeIndex, currentNode.id)

            if (nodeFromTree) {
                useSessionStore.getState().setCurrentNode(nodeFromTree)
            } else {
                throw new StateError('Nodo successivo non trovato nello stato locale.', {
                    code: 'TREE_FORWARD_NODE_NOT_FOUND',
                    context: { currentTreeIndex, nodeId: currentNode.id },
                })
            }
        }
    }

    // Modify a previous answer by going back and re-answering
    async modifyPreviousAnswer() {}

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
        const deviceObj = this.#createDeviceFromResponse(response.device)
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
            useSessionStore
                .getState()
                .setDevicePosition(current_asset_index, current_tree_index, current_node_id)

            // Load the current node from TreeStore using tree index and node ID
            this.#setCurrentNodeFromResponse(response, response.position)
        }

        // Transform aggregate_results to RequirementResult format and save to ResultStore
        const transformedResults = this.#transformResultsToRequirementResults(
            response.aggregate_results
        )
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
            const sessionId = useSessionStore.getState().sessionId

            // Delete session on backend
            if (sessionId) {
                await apiClient.delete(`/session/${sessionId}/delete`)
            }
        } catch {
            // Continue clearing local stores even if backend delete fails
        } finally {
            // Always clear local stores
            deviceService.clearDevice()
            this.clearSession()
        }
    }

    // Fetch final results after session is finished
    async fetchFinalResults() {}

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
            const sessionId = useSessionStore.getState().sessionId

            // Delete session on backend
            if (sessionId) {
                await apiClient.delete(`/session/${sessionId}/delete`)
            }
        } catch {
            // Continue clearing local stores even if backend delete fails
        } finally {
            // Always clear local stores
            useSessionStore.getState().clearStore()
            useResultStore.getState().clearStore()
        }
    }
}

export default new SessionService() // Esportato come Singleton
