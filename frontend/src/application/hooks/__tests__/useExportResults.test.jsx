import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExportResults } from '@application/hooks/useExportResults'

const mocks = vi.hoisted(() => ({
    uiState: {
        isExporting: false,
        setExporting: vi.fn(),
    },
    exportService: {
        exportResultsAsCSV: vi.fn(),
        exportResultsAsPDF: vi.fn(),
    },
    notifications: {
        notifyError: vi.fn(),
    },
}))

vi.mock('../../../state/UIStore', () => ({
    default: (selector) => selector(mocks.uiState),
}))

vi.mock('../../services/ExportService', () => ({
    default: mocks.exportService,
}))

vi.mock('../../services/AppServices', () => ({
    notificationService: mocks.notifications,
}))

describe('useExportResults', () => {
    beforeEach(() => {
        mocks.uiState.isExporting = false
        mocks.uiState.setExporting.mockReset()
        mocks.exportService.exportResultsAsCSV.mockReset()
        mocks.exportService.exportResultsAsPDF.mockReset()
        mocks.notifications.notifyError.mockReset()
    })

    it('opens format dialog when export is requested', () => {
        const { result } = renderHook(() => useExportResults('session-1'))

        expect(result.current.showFormatDialog).toBe(false)

        act(() => {
            result.current.handleExportClick()
        })

        expect(result.current.showFormatDialog).toBe(true)
    })

    it('exports CSV and toggles exporting state', async () => {
        const { result } = renderHook(() => useExportResults('session-1'))

        await act(async () => {
            await result.current.handleExportFormat('csv')
        })

        expect(mocks.exportService.exportResultsAsCSV).toHaveBeenCalledWith('session-1')
        expect(mocks.exportService.exportResultsAsPDF).not.toHaveBeenCalled()
        expect(mocks.uiState.setExporting).toHaveBeenNthCalledWith(1, true)
        expect(mocks.uiState.setExporting).toHaveBeenNthCalledWith(2, false)
    })

    it('notifies errors for unsupported formats', async () => {
        const { result } = renderHook(() => useExportResults('session-1'))

        await act(async () => {
            await result.current.handleExportFormat('xml')
        })

        expect(mocks.exportService.exportResultsAsCSV).not.toHaveBeenCalled()
        expect(mocks.exportService.exportResultsAsPDF).not.toHaveBeenCalled()
        expect(mocks.notifications.notifyError).toHaveBeenCalledTimes(1)
        expect(mocks.uiState.setExporting).toHaveBeenNthCalledWith(1, true)
        expect(mocks.uiState.setExporting).toHaveBeenNthCalledWith(2, false)
    })
})


