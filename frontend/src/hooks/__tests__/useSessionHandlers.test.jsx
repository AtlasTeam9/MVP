import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSessionHandlers } from '../sessionHooks/useSessionHandlers'

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    uiState: {
        isSessionActionLoading: false,
        setSessionActionLoading: vi.fn(),
        setSaving: vi.fn(),
    },
    getHandlerConfigs: vi.fn(),
    createAsyncHandler: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
    useNavigate: () => mocks.navigate,
}))

vi.mock('../../store/UIStore', () => ({
    default: (selector) => selector(mocks.uiState),
}))

vi.mock('../sessionHooks/sessionHandlersConfig', () => ({
    getHandlerConfigs: mocks.getHandlerConfigs,
    createAsyncHandler: mocks.createAsyncHandler,
}))

describe('useSessionHandlers', () => {
    beforeEach(() => {
        mocks.getHandlerConfigs.mockReset()
        mocks.createAsyncHandler.mockReset()
        mocks.uiState.isSessionActionLoading = false
        mocks.uiState.setSessionActionLoading.mockReset()
        mocks.uiState.setSaving.mockReset()

        mocks.getHandlerConfigs.mockReturnValue([
            {
                name: 'handleYesClick',
                fn: vi.fn(),
                errorMsg: 'yes error',
                isSavingAction: false,
                onSuccess: undefined,
            },
            {
                name: 'handleSaveAndExitClick',
                fn: vi.fn(),
                errorMsg: 'save error',
                isSavingAction: true,
                onSuccess: vi.fn(),
            },
        ])

        mocks.createAsyncHandler.mockImplementation(() => vi.fn())
    })

    it('builds handlers from configuration and exposes loading/error state', () => {
        const { result } = renderHook(() => useSessionHandlers())

        expect(mocks.getHandlerConfigs).toHaveBeenCalledWith(mocks.navigate)
        expect(mocks.createAsyncHandler).toHaveBeenCalledTimes(2)
        expect(result.current).toMatchObject({
            isLoading: false,
            error: null,
        })
        expect(typeof result.current.handleYesClick).toBe('function')
        expect(typeof result.current.handleSaveAndExitClick).toBe('function')
    })
})
