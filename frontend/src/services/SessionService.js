/* eslint-disable camelcase */
import useSessionStore from '../store/SessionStore'
import useDeviceStore from '../store/DeviceStore'
import useTreeStore from '../store/TreeStore'
import useResultStore from '../store/ResultStore'
import apiClient from '../infrastructure/api/AxiosApiClient'
import Device from '../domain/Device'
import Asset from '../domain/Asset'

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

    // Private method to convert Device object to API payload (camelCase to snake_case)
    #convertDeviceToPayload(device) {
        const deviceDict = device.toDict()
        return {
            device_name: deviceDict.deviceName,
            operating_system: deviceDict.operatingSystem,
            firmware_version: deviceDict.firmwareVersion,
            functionalities: deviceDict.functionalities,
            description: deviceDict.description || null,
            assets: deviceDict.assets.map((asset) => ({
                id: asset.id,
                name: asset.name,
                type: asset.type,
                is_sensitive: asset.isSensitive,
                description: asset.desc || null,
            })),
        }
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
        useDeviceStore.getState().setDevice(deviceObj)
        useSessionStore
            .getState()
            .setDevicePosition(
                position.current_asset_index,
                position.current_tree_index,
                position.current_node_id
            )

        this.#setCurrentNodeFromResponse(response, position)

        console.log(
            'Sessione salvata nel SessionStore, device salvato nel DeviceStore, posizione inizializzata: ',
            position
        ) // TODO: eliminare

        return { sessionId, device: deviceObj, position }
    }

    // Create a new session by uploading a device file (JSON)
    async createSessionWithFile(file) {
        try {
            const formData = new FormData()
            formData.append('file', file)

            // API call to create a session with the uploaded file
            const response = await apiClient.post('/session/create_session_with_file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            return this.#initializeSessionFromResponse(response)
        } catch (error) {
            console.error('Errore nella creazione della sessione:', error)
            // TODO: mostrare messaggio di errore
            throw error
        }
    }

    // Create a new session from a Device object (direct API call without file)
    async createSessionWithDevice(device) {
        try {
            const devicePayload = this.#convertDeviceToPayload(device)

            // API call to create a session with the device object directly
            const response = await apiClient.post('/session/create_session', devicePayload)

            return this.#initializeSessionFromResponse(response)
        } catch (error) {
            console.error('Errore nella creazione della sessione:', error)
            // TODO: mostrare messaggio di errore
            throw error
        }
    }

    resumeSession(requirementId, assetId) {
        console.log(`Ripresa sessione: req=${requirementId}, asset=${assetId}`)
        // TODO: Logica per riprendere una sessione specifica
    }

    importSessionFromFile(content) {
        console.log('Importazione sessione da file', content)
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
            console.error('Next node not found in TreeStore') // TODO: sistemare
            return
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
            console.error('First node of tree not found') // TODO: sistemare
            return
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

        // TODO: eliminare
        if (assetChanged) {
            console.log(
                `Asset cambiato: da ${previousAssetIndex} a ${current_asset_index},
                saltati gli alberi intermedi`
            )
        }

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
        if (!response.found || !response.node_id) {
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
        try {
            const sessionId = useSessionStore.getState().sessionId
            const currentAssetIndex = useSessionStore.getState().currentAssetIndex
            const currentNode = useSessionStore.getState().currentNode
            const currentTreeIndex = useSessionStore.getState().currentTreeIndex

            // Check if futureHistory is not empty, meaning user went back and is
            // answering a previous question
            const futureHistory = useSessionStore.getState().futureHistory
            const hasGoingBack = futureHistory.length > 0

            // Save the current question and answer to pastHistory
            useSessionStore.getState().selectAnswer(answer)

            // Clear future history since we're creating a new path by answering
            useSessionStore.getState().clearFuture()

            let response
            if (hasGoingBack) {
                // User went back and is changing a previous answer - use go_back endpoint
                response = await apiClient.post(`/session/${sessionId}/go_back`, {
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
        } catch (error) {
            console.error('Errore nel sending answer:', error) // TODO: mostrare messaggio di errore
            throw error
        }
    }

    // Go back to a previous node and change answer
    async previousStep() {
        try {
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
                    console.error('Previous node not found in TreeStore')
                }
            }
        } catch (error) {
            console.error('Error going to previous step:', error)
            throw error
        }
    }

    // Go forward in the future history (if user went back previously)
    async forwardStep() {
        try {
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
                    console.error('Next node not found in TreeStore')
                }
            }
        } catch (error) {
            console.error('Error going to forward step:', error)
            throw error
        }
    }

    // Modify a previous answer by going back and re-answering
    async modifyPreviousAnswer() {}

    // Delete session and clear stores
    async saveAndExit() {}

    // Fetch final results after session is finished
    async fetchFinalResults() {}

    // Clear all session-related data from stores (used when exiting session or returning to home)
    clearSession() {
        useSessionStore.getState().clearStore()
        useResultStore.getState().clearStore()
    }
}

export default new SessionService() // Esportato come Singleton
