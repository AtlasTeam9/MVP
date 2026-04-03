import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHomeNavigation } from '@application/hooks/useHomeNavigation'

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    sessionService: {
        createSessionWithFile: vi.fn(),
        loadSessionFromFile: vi.fn(),
    },
    notifications: {
        notifyError: vi.fn(),
    },
}))

vi.mock('react-router-dom', () => ({
    useNavigate: () => mocks.navigate,
}))

vi.mock('../../services/SessionService', () => ({
    default: mocks.sessionService,
}))

vi.mock('../../services/AppServices', () => ({
    notificationService: mocks.notifications,
}))

describe('useHomeNavigation', () => {
    beforeEach(() => {
        mocks.navigate.mockReset()
        mocks.sessionService.createSessionWithFile.mockReset()
        mocks.sessionService.loadSessionFromFile.mockReset()
        mocks.notifications.notifyError.mockReset()
    })

    it('navigates to device creation route', () => {
        const { result } = renderHook(() => useHomeNavigation())

        act(() => {
            result.current.handleCreateDevice()
        })

        expect(mocks.navigate).toHaveBeenCalledWith('/device/new')
    })

    it('loads device file and navigates to summary on success', async () => {
        mocks.sessionService.createSessionWithFile.mockResolvedValue(undefined)
        const file = new File(['{}'], 'device.json', { type: 'application/json' })
        const { result } = renderHook(() => useHomeNavigation())

        await act(async () => {
            await result.current.handleLoadDevice(file)
        })

        expect(mocks.sessionService.createSessionWithFile).toHaveBeenCalledWith(file)
        expect(mocks.navigate).toHaveBeenCalledWith('/device/summary')
        expect(mocks.notifications.notifyError).not.toHaveBeenCalled()
    })

    it('notifies errors when loading previous session fails', async () => {
        const error = new Error('load failed')
        const file = new File(['{}'], 'session.json', { type: 'application/json' })
        mocks.sessionService.loadSessionFromFile.mockRejectedValue(error)
        const { result } = renderHook(() => useHomeNavigation())

        await act(async () => {
            await result.current.handleLoadPreviousSession(file)
        })

        expect(mocks.sessionService.loadSessionFromFile).toHaveBeenCalledWith(file)
        expect(mocks.navigate).not.toHaveBeenCalledWith('/results')
        expect(mocks.notifications.notifyError).toHaveBeenCalledWith(error)
    })
})

