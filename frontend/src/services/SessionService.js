/* eslint-disable camelcase */
import useSessionStore from '../store/SessionStore'
import useDeviceStore from '../store/DeviceStore'
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

    // Private method to initialize stores and return session data from API response
    #initializeSessionFromResponse(response) {
        const { session_id: sessionId, device, position } = response
        const deviceObj = this.#createDeviceFromResponse(device)

        // Initialize stores with the new session data
        useSessionStore.getState().setSessionId(sessionId)
        useDeviceStore.getState().setDevice(deviceObj)
        useSessionStore
            .getState()
            .setDevicePosition(
                position.current_asset_index,
                position.current_tree_index,
                position.current_node_id
            )

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
            console.log('Device Payload being sent:', JSON.stringify(devicePayload, null, 2))

            // API call to create a session with the device object directly
            const response = await apiClient.post('/session/create_session', devicePayload)

            return this.#initializeSessionFromResponse(response)
        } catch (error) {
            console.error('Errore nella creazione della sessione:', error)
            // TODO: mostrare messaggio di errore
            throw error
        }
    }

    // Function to start a new session for a given device
    // async startSession(deviceId) {
    //     // TODO: chiamata API per avviare la sessione e ottenere il sessionId e il nodo iniziale
    //     // const response = await apiClient.post('/sessions/start', { deviceId })
    //     useSessionStore.getState().clearStore()
    // }

    resumeSession(requirementId, assetId) {
        console.log(`Ripresa sessione: req=${requirementId}, asset=${assetId}`)
        // TODO: Logica per riprendere una sessione specifica
    }

    importSessionFromFile(content) {
        console.log('Importazione sessione da file', content)
        // TODO: Validazione file JSON e popolamento dello store
    }

    async sendAnswer(choice) {
        console.log(`Risposta inviata: ${choice}`)
        useSessionStore.getState().selectAnswer(choice) // Aggiorna lo store
        // TODO: Chiamata API per inviare la risposta e ottenere il prossimo nodo
    }

    async previousStep() {
        console.log('Torno al passo precedente')
        // TODO: Logica per recuperare il nodo precedente dalla cronologia o dall'API
    }

    async forwardStep() {
        console.log('Vado al passo successivo (se già risposto)')
        // TODO: Logica per navigare in avanti nella futureHistory
    }

    async modifyPreviousAnswer(nodeId, newChoice) {
        console.log(`Modifico risposta per nodo ${nodeId} in ${newChoice}`)
        // TODO: Aggiornare pastHistory troncando il futuro e inviare all'API
    }

    async saveAndExit() {
        console.log('Salvataggio e uscita')
        // TODO: Chiamata API per salvare lo stato persistente
    }

    async fetchFinalResults() {
        console.log('Recupero risultati finali')
        // TODO: Recuperare i risultati e chiamare setResults() nello store
    }
}

export default new SessionService() // Esportato come Singleton
