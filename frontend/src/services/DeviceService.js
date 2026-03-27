// import apiClient from '../infrastructure/api/AxiosApiClient'
import Device from '../domain/Device'
import { deviceSchema } from '../domain/schemas/DeviceSchema'
import useDeviceStore from '../store/DeviceStore'
import exportService from './ExportService'

// Custom hook to get the current device from the store
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

    // Upload of a device file (JSON) - delega la logica al backend
    async receiveFile(file) {
        if (!this.validateFile(file)) throw new Error('Invalid file type')
        // La logica di caricamento e validazione è ora gestita dal SessionService e dal backend
        // Questo metodo rimane per compatibilità
        return file
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

    // Create a new device and save it to the DeviceStore
    createDevice(device) {
        useDeviceStore.getState().setDevice(device)
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

    saveDeviceToFile() {
        exportService.exportDeviceAsJSON(this.getCurrentDevice())
    }

    // Clear the current device from the store
    clearDevice() {
        useDeviceStore.getState().clearStore()
    }
}

// Exportation of the service as a singleton instance
export default new DeviceService()
