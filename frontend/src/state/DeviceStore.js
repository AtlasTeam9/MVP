import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import Device from '@domain/Device'

// Helper function to create a copy of a device
const copyDevice = (device) =>
    new Device(
        device.name,
        [...device.assets],
        device.operatingSystem,
        device.firmwareVersion,
        device.functionalities,
        device.description
    )

// Custom hook for managing device state across the application
const useDeviceStore = create(
    devtools(
        (set) => ({
            // The current device being edited or viewed
            currentDevice: null,

            // Set the current device
            setDevice: (device) => set({ currentDevice: device }),

            // Clear the store
            clearStore: () => set({ currentDevice: null }),

            // Add a new asset to the current device
            addAsset: (asset) => {
                set((state) => {
                    if (!state.currentDevice) return { currentDevice: null }
                    const updatedDevice = copyDevice(state.currentDevice)
                    updatedDevice.addAsset(asset)
                    return { currentDevice: updatedDevice }
                })
            },

            // Remove a specific asset from the current device
            deleteAsset: (assetId) =>
                set((state) => {
                    if (!state.currentDevice) return { currentDevice: null }
                    const updatedDevice = copyDevice(state.currentDevice)
                    updatedDevice.deleteAsset(assetId)
                    return { currentDevice: updatedDevice }
                }),
        }),
        { name: 'DeviceStore' }
    )
)

export default useDeviceStore
