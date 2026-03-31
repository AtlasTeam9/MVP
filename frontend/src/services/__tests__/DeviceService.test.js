import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    deviceState: {
        currentDevice: { id: 'device-1' },
        setDevice: vi.fn(),
        addAsset: vi.fn(),
        deleteAsset: vi.fn(),
        clearStore: vi.fn(),
    },
    uiState: {
        setDirty: vi.fn(),
    },
    exportService: {
        exportDeviceAsJSON: vi.fn(),
    },
    useDeviceStoreHook: vi.fn(),
}))

vi.mock('../../store/DeviceStore', () => {
    const hook = (...args) => mocks.useDeviceStoreHook(...args)
    hook.getState = () => mocks.deviceState
    return { default: hook }
})

vi.mock('../../store/UIStore', () => ({
    default: {
        getState: () => mocks.uiState,
    },
}))

vi.mock('../ExportService', () => ({
    default: mocks.exportService,
}))

import deviceService, { useCurrentDevice } from '../DeviceService'

describe('DeviceService', () => {
    beforeEach(() => {
        mocks.deviceState = {
            currentDevice: { id: 'device-1' },
            setDevice: vi.fn(),
            addAsset: vi.fn(),
            deleteAsset: vi.fn(),
            clearStore: vi.fn(),
        }
        mocks.uiState = {
            setDirty: vi.fn(),
        }
        mocks.exportService.exportDeviceAsJSON.mockReset()

        mocks.useDeviceStoreHook.mockReset()
        mocks.useDeviceStoreHook.mockImplementation((selector) => selector(mocks.deviceState))
    })

    it('useCurrentDevice returns current device from store selector', () => {
        const currentDevice = useCurrentDevice()

        expect(currentDevice).toEqual({ id: 'device-1' })
        expect(mocks.useDeviceStoreHook).toHaveBeenCalledTimes(1)
    })

    it('createDevice stores the provided device', () => {
        const device = { id: 'device-2' }

        deviceService.createDevice(device)

        expect(mocks.deviceState.setDevice).toHaveBeenCalledWith(device)
    })

    it('addAssetToDevice updates store and marks UI dirty', () => {
        const asset = { id: 'asset-1' }

        deviceService.addAssetToDevice(asset)

        expect(mocks.deviceState.addAsset).toHaveBeenCalledWith(asset)
        expect(mocks.uiState.setDirty).toHaveBeenCalledWith(true)
    })

    it('removeAsset updates store and marks UI dirty', () => {
        deviceService.removeAsset('asset-7')

        expect(mocks.deviceState.deleteAsset).toHaveBeenCalledWith('asset-7')
        expect(mocks.uiState.setDirty).toHaveBeenCalledWith(true)
    })

    it('saveDeviceToFile exports current device and resets dirty flag', () => {
        const device = { id: 'device-9' }
        mocks.deviceState.currentDevice = device

        deviceService.saveDeviceToFile()

        expect(mocks.exportService.exportDeviceAsJSON).toHaveBeenCalledWith(device)
        expect(mocks.uiState.setDirty).toHaveBeenCalledWith(false)
    })

    it('clearDevice clears device store', () => {
        deviceService.clearDevice()

        expect(mocks.deviceState.clearStore).toHaveBeenCalledTimes(1)
    })
})
