import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExportSession } from '../useExportSession'

const mocks = vi.hoisted(() => ({
    uiState: {
        isExportingSession: false,
        setExportingSession: vi.fn(),
    },
    exportService: {
        exportSessionAsJSON: vi.fn(),
    },
    sessionService: {
        getFormattedAnswers: vi.fn(),
    },
    notifications: {
        notifyError: vi.fn(),
    },
}))

vi.mock('../../store/UIStore', () => ({
    default: (selector) => selector(mocks.uiState),
}))

vi.mock('../../services/ExportService', () => ({
    default: mocks.exportService,
}))

vi.mock('../../services/SessionService', () => ({
    default: mocks.sessionService,
}))

vi.mock('../../infrastructure/notifications/NotificationManager', () => ({
    default: mocks.notifications,
}))

describe('useExportSession', () => {
    beforeEach(() => {
        mocks.uiState.isExportingSession = false
        mocks.uiState.setExportingSession.mockReset()
        mocks.exportService.exportSessionAsJSON.mockReset()
        mocks.sessionService.getFormattedAnswers.mockReset()
        mocks.notifications.notifyError.mockReset()
    })

    it('exports session using formatted answers and toggles exporting state', async () => {
        const answers = [{ nodeId: 'node1', answer: true }]
        mocks.sessionService.getFormattedAnswers.mockReturnValue(answers)

        const { result } = renderHook(() => useExportSession('session-1'))

        await act(async () => {
            await result.current.handleExportSessionClick()
        })

        expect(mocks.sessionService.getFormattedAnswers).toHaveBeenCalledTimes(1)
        expect(mocks.exportService.exportSessionAsJSON).toHaveBeenCalledWith('session-1', answers)
        expect(mocks.uiState.setExportingSession).toHaveBeenNthCalledWith(1, true)
        expect(mocks.uiState.setExportingSession).toHaveBeenNthCalledWith(2, false)
    })

    it('notifies errors when export fails', async () => {
        const testError = new Error('Export failed')
        mocks.sessionService.getFormattedAnswers.mockReturnValue([])
        mocks.exportService.exportSessionAsJSON.mockRejectedValue(testError)

        const { result } = renderHook(() => useExportSession('session-1'))

        await act(async () => {
            await result.current.handleExportSessionClick()
        })

        expect(mocks.notifications.notifyError).toHaveBeenCalledWith(testError)
        expect(mocks.uiState.setExportingSession).toHaveBeenNthCalledWith(1, true)
        expect(mocks.uiState.setExportingSession).toHaveBeenNthCalledWith(2, false)
    })
})
