import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAssetManagement } from '../useAssetManagement'

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    currentDevice: {
        id: 'dev-1',
        name: 'Device A',
        assets: [{ id: 'asset-1', name: 'Asset 1' }],
    },
    uiState: {
        isDirty: false,
    },
    deviceService: {
        saveDeviceToFile: vi.fn(),
        removeAsset: vi.fn(),
        clearDevice: vi.fn(),
    },
    sessionService: {
        createSessionWithDevice: vi.fn(),
        clearSession: vi.fn(),
    },
    notifications: {
        notifyError: vi.fn(),
    },
}))

vi.mock('react-router-dom', () => ({
    useNavigate: () => mocks.navigate,
}))

vi.mock('../../services/DeviceService', () => ({
    useCurrentDevice: () => mocks.currentDevice,
    default: mocks.deviceService,
}))

vi.mock('../../services/SessionService', () => ({
    default: mocks.sessionService,
}))

vi.mock('../../store/UIStore', () => ({
    default: (selector) => selector(mocks.uiState),
}))

vi.mock('../../infrastructure/notifications/NotificationManager', () => ({
    default: mocks.notifications,
}))

function resetUseAssetManagementMocks() {
    beforeEach(() => {
        mocks.navigate.mockReset()
        mocks.deviceService.saveDeviceToFile.mockReset()
        mocks.deviceService.removeAsset.mockReset()
        mocks.deviceService.clearDevice.mockReset()
        mocks.sessionService.createSessionWithDevice.mockReset()
        mocks.sessionService.clearSession.mockReset()
        mocks.notifications.notifyError.mockReset()
        mocks.sessionService.createSessionWithDevice.mockResolvedValue(undefined)
        mocks.sessionService.clearSession.mockResolvedValue(undefined)
        mocks.uiState.isDirty = false
        mocks.currentDevice = {
            id: 'dev-1',
            name: 'Device A',
            assets: [{ id: 'asset-1', name: 'Asset 1' }],
        }
    })
}

describe('useAssetManagement - summary flow', () => {
    resetUseAssetManagementMocks()

    it('opens unsaved dialog when state is dirty', async () => {
        mocks.uiState.isDirty = true
        const { result } = renderHook(() => useAssetManagement())

        await act(async () => {
            await result.current.onGoToSummary()
        })

        expect(result.current.showUnsavedDialog).toBe(true)
        expect(mocks.sessionService.createSessionWithDevice).not.toHaveBeenCalled()
    })

    it('saves then proceeds to summary when confirmed', async () => {
        const { result } = renderHook(() => useAssetManagement())

        await act(async () => {
            await result.current.onConfirmSaveBeforeSummary()
        })

        expect(mocks.deviceService.saveDeviceToFile).toHaveBeenCalledTimes(1)
        expect(mocks.sessionService.createSessionWithDevice).toHaveBeenCalledWith(
            mocks.currentDevice
        )
        expect(mocks.navigate).toHaveBeenCalledWith('/device/summary', {
            state: { fromDeviceAssetManagement: true },
        })
        expect(result.current.showUnsavedDialog).toBe(false)
    })

})

describe('useAssetManagement - home action', () => {
    resetUseAssetManagementMocks()

    it('clears local state and navigates home', async () => {
        const { result } = renderHook(() => useAssetManagement())

        await act(async () => {
            await result.current.onHome()
        })

        expect(mocks.deviceService.clearDevice).toHaveBeenCalledTimes(1)
        expect(mocks.sessionService.clearSession).toHaveBeenCalledTimes(1)
        expect(mocks.navigate).toHaveBeenCalledWith('/')
    })
})
