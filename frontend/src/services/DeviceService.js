import apiClient from '../infrastructure/api/AxiosApiClient'
import Device from '../domain/Device'
import { deviceSchema } from '../domain/schemas/DeviceSchema'
import useDeviceStore from '../store/DeviceStore'

// Custom hook to get the current device from the store (with reactivity)
export function useCurrentDevice() {
    return useDeviceStore((state) => state.currentDevice)
}

class DeviceService {
    // Converts snake_case JSON data to camelCase for internal use
    normalizeDeviceData(data) {
        return {
            name: data.device_name,
            operatingSystem: data.operating_system,
            firmwareVersion: data.firmware_version,
            functionalities: data.functionalities,
            assets: data.assets,
            description: data.description,
        }
    }

    // Upload of a device file (JSON)
    async receiveFile(file) {
        if (!this.validateFile(file)) throw new Error('Invalid file type')

        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = async (env) => {
                try {
                    const data = JSON.parse(env.target.result)
                    const normalizedData = this.normalizeDeviceData(data)
                    if (this.validateDeviceData(normalizedData)) {
                        const device = new Device(
                            normalizedData.name,
                            normalizedData.assets || [],
                            normalizedData.operatingSystem,
                            normalizedData.firmwareVersion,
                            normalizedData.functionalities,
                            normalizedData.description
                        )
                        useDeviceStore.getState().setDevice(device)
                        resolve(device)
                    } else {
                        reject(new Error('Device data validation failed'))
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

    // Get the current device from the store
    getCurrentDevice() {
        return useDeviceStore.getState().currentDevice
    }

    // Methods for asset management
    addAssetToDevice(asset) {
        useDeviceStore.getState().addAsset(asset)
    }

    removeAsset(assetId) {
        useDeviceStore.getState().deleteAsset(assetId)
    }

    async persistToFile() {
        /* Logic for local download if needed */
    }

    // Clear the current device from the store
    clearDevice() {
        useDeviceStore.getState().clearDevice()
    }
}

// Exportation of the service as a singleton instance
export default new DeviceService()
