import useDeviceStore from '../store/DeviceStore'
import useUIStore from '../store/UIStore'
import exportService from './ExportService'

// Custom hook to get the current device from the store
export function useCurrentDevice() {
    return useDeviceStore((state) => state.currentDevice)
}

class DeviceService {
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
        useUIStore.getState().setDirty(true)
    }

    removeAsset(assetId) {
        useDeviceStore.getState().deleteAsset(assetId)
        useUIStore.getState().setDirty(true)
    }

    saveDeviceToFile() {
        exportService.exportDeviceAsJSON(this.getCurrentDevice())
        useUIStore.getState().setDirty(false)
    }

    // Clear the current device from the store
    clearDevice() {
        useDeviceStore.getState().clearStore()
    }
}

// Exportation of the service as a singleton instance
export default new DeviceService()
