import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import Device from '@domain/Device'

const copyDevice = (device) =>
    new Device(
        device.name,
        [...device.assets],
        device.operatingSystem,
        device.firmwareVersion,
        device.functionalities,
        device.description
    )

const useDeviceStore = create(
    devtools(
        (set) => ({
            currentDevice: null,

            setDevice: (device) => set({ currentDevice: device }),

            clearStore: () => set({ currentDevice: null }),

            addAsset: (asset) => {
                set((state) => {
                    if (!state.currentDevice) return { currentDevice: null }
                    const updatedDevice = copyDevice(state.currentDevice)
                    updatedDevice.addAsset(asset)
                    return { currentDevice: updatedDevice }
                })
            },

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
