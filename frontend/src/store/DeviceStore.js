import { create } from 'zustand'

// Custom hook for managing device state across the application
const useDeviceStore = create((set) => ({
    currentDevice: null,

    // Set the current device
    setDevice: (device) => set({ currentDevice: device }),

    // Clear the current device
    clearDevice: () => set({ currentDevice: null }),

    // Remove a specific asset from the current device
    deleteAsset: (assetId) =>
        set((state) => ({
            currentDevice: state.currentDevice
                ? {
                      ...state.currentDevice,
                      assets: state.currentDevice.assets.filter((aaa) => aaa.id !== assetId),
                  }
                : null,
        })),
}))

export default useDeviceStore
