import apiClient from '../infrastructure/api/AxiosApiClient'
import Device from '../domain/Device'
import { deviceSchema } from '../domain/schemas/DeviceSchema'
import useDeviceStore from '../store/DeviceStore'

class DeviceService {
    // Upload of a device file (JSON)
    async receiveFile(file) {
        if (!this.validateFile(file)) throw new Error('Invalid file type')

        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = async (env) => {
                try {
                    const data = JSON.parse(env.target.result)
                    if (this.validateDeviceData(data)) {
                        const device = new Device(
                            data.name,
                            data.assets || [],
                            data.operatingSystem,
                            data.firmwareVersion,
                            data.functionalities,
                            data.description
                        )
                        useDeviceStore.setDevice(device)
                        resolve(device)
                    }
                } catch (err) {
                    console.error('Error parsing JSON:', err.message)
                    reject(new Error('JSON parsing failed'))
                }
            }
            reader.readAsText(file)
        })
    }

    // Validates that the file is a JSON file
    validateFile(file) {
        return file && file.type === 'application/json'
    }

    // Validates the device data structure
    validateDeviceData(data) {
        // TODO: che controlli devono venire fatti sul file del dispositivo in ingresso?
        const result = deviceSchema.safeParse(data)
        return result.success
    }

    // API call to create a new device
    async createDevice(device) {
        const payload = device instanceof Device ? device.toDict() : device
        const response = await apiClient.post('/devices/', payload)

        useDeviceStore.getState().setDevice(device)
        return response
    }

    // Methods for asset management
    async addAssetToDevice(assetData) {
        /* Logic to add asset */
        console.log('Aggiunta asset al dispositivo:', assetData.name)
    }
    async removeAsset(assetId) {
        console.log('Rimozione asset con ID:', assetId)
        /* Logic to remove asset */
    }
    async persistToFile() {
        /* Logic for local download if needed */
    }
}

// Exportation of the service as a singleton instance
export default new DeviceService()
