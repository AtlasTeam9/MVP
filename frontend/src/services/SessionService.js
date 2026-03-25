/* eslint-disable camelcase */
import useSessionStore from '../store/SessionStore'
import useDeviceStore from '../store/DeviceStore'
import useTreeStore from '../store/TreeStore'
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

            // TODO: eliminare
            console.log('createSessionWithFile - Struttura risposta:', {
                sessionId: response.session_id,
                position: response.position,
                device: response.device
                    ? { name: response.device.device_name, assets: response.device.assets?.length }
                    : null,
                currentNode: response.current_node,
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

            // TODO: eliminare
            console.log('createSessionWithDevice - Struttura risposta:', {
                sessionId: response.session_id,
                position: response.position,
                device: response.device
                    ? { name: response.device.device_name, assets: response.device.assets?.length }
                    : null,
                currentNode: response.current_node,
            })

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
    #handleNextNodeSameTree(response, currentTreeIndex, currentAssetIndex) {
        const nextNode = useTreeStore
            .getState()
            .getNodeByTreeIndexAndNodeId(currentTreeIndex, response.next_node_id)

        if (!nextNode) {
            console.error('Next node not found in TreeStore') // TODO: sistemare
            return
        }

        useSessionStore
            .getState()
            .setDevicePosition(currentAssetIndex, currentTreeIndex, response.next_node_id)
        useSessionStore.getState().setCurrentNode(nextNode)
    }

    // Private helper to handle tree completion
    #handleTreeCompleted(response, currentTreeIndex, currentAssetIndex) {
        if (response.session_finished) {
            console.log('Sessione terminata', response.results) // TODO: mostrare view risultati finali
            useSessionStore.getState().setTestFinished(true)
            return
        }

        const nextTreeIndex = currentTreeIndex + 1
        const nextNode = this.#getFirstNodeOfTree(nextTreeIndex)

        if (!nextNode) {
            console.error('First node of next tree not found') // TODO: sistemare
            return
        }

        useSessionStore.getState().setDevicePosition(currentAssetIndex, nextTreeIndex, 'node1')
        useSessionStore.getState().setCurrentNode(nextNode)
    }

    // Answer the current question and move to the next node
    async sendAnswer(answer) {
        try {
            const sessionId = useSessionStore.getState().sessionId
            const currentTreeIndex = useSessionStore.getState().currentTreeIndex
            const currentAssetIndex = useSessionStore.getState().currentAssetIndex

            const response = await apiClient.post(`/session/${sessionId}/answer`, {
                answer,
            })

            console.log('Answer response:', response)
            // TODO:"Andrea" il backend se un albero era NA o FAIL saltava tutti gli alberi,
            // TODO: ma il frontend non lo capiva perchè non c'erano abbastanza informazioni
            // TODO: ora la risposta ha l'indice dell'albero e dell'asset a cui si è
            if (response.tree_completed) {
                this.#handleTreeCompleted(response, currentTreeIndex, currentAssetIndex)
            } else {
                this.#handleNextNodeSameTree(response, currentTreeIndex, currentAssetIndex)
            }
        } catch (error) {
            console.error('Errore nel sending answer:', error) // TODO: mostrare messaggio di errore
            throw error
        }
    }

    // Go back to a previous node and change answer
    async previousStep() { }

    // Go forward in the future history (if user went back previously)
    async forwardStep() { }

    // Modify a previous answer by going back and re-answering
    async modifyPreviousAnswer() { }

    // Delete session and clear stores
    async saveAndExit() { }

    // Fetch final results after session is finished
    async fetchFinalResults() { }
}

export default new SessionService() // Esportato come Singleton
