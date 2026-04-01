import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResultViewLogic } from '@application/hooks/useResultViewLogic'

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    resetHome: vi.fn(),
    resultState: { results: [{ code: 'REQ-1' }] },
    sessionState: {
        sessionId: 'session-1',
        isTestFinished: true,
        isSessionUploaded: false,
        resultsPerAsset: { 'asset-1': [] },
    },
    currentDevice: { id: 'dev-1' },
    exportResults: {
        isExporting: false,
        showFormatDialog: false,
        handleExportClick: vi.fn(),
        handleExportFormat: vi.fn(),
        setShowFormatDialog: vi.fn(),
    },
    exportSession: {
        isExportingSession: false,
        handleExportSessionClick: vi.fn(),
    },
}))

vi.mock('react-router-dom', () => ({
    useNavigate: () => mocks.navigate,
}))

vi.mock('../../../state/ResultStore', () => ({
    default: (selector) => selector(mocks.resultState),
}))

vi.mock('../../../state/SessionStore', () => ({
    default: (selector) => selector(mocks.sessionState),
}))

vi.mock('../useCurrentDevice', () => ({
    useCurrentDevice: () => mocks.currentDevice,
}))

vi.mock('../useExportResults', () => ({
    useExportResults: () => mocks.exportResults,
}))

vi.mock('../useExportSession', () => ({
    useExportSession: () => mocks.exportSession,
}))

vi.mock('../../services/NavigationService', () => ({
    resetSessionAndNavigateHome: (...args) => mocks.resetHome(...args),
}))

describe('useResultViewLogic', () => {
    beforeEach(() => {
        mocks.navigate.mockReset()
        mocks.resetHome.mockReset()
        mocks.exportResults.handleExportClick.mockReset()
        mocks.exportResults.handleExportFormat.mockReset()
        mocks.exportResults.setShowFormatDialog.mockReset()
        mocks.exportSession.handleExportSessionClick.mockReset()
    })

    it('exposes state from stores and nested hooks', () => {
        const { result } = renderHook(() => useResultViewLogic())

        expect(result.current.results).toEqual([{ code: 'REQ-1' }])
        expect(result.current.device).toEqual({ id: 'dev-1' })
        expect(result.current.resultsPerAsset).toEqual({ 'asset-1': [] })
        expect(result.current.isTestFinished).toBe(true)
        expect(result.current.isSessionUploaded).toBe(false)
        expect(result.current.isExporting).toBe(false)
        expect(result.current.showFormatDialog).toBe(false)
        expect(result.current.isExportingSession).toBe(false)
    })

    it('navigates to test and modify routes with handlers', () => {
        const { result } = renderHook(() => useResultViewLogic())

        act(() => {
            result.current.handleResumeSession()
            result.current.handleModifySession()
        })

        expect(mocks.navigate).toHaveBeenNthCalledWith(1, '/session/test')
        expect(mocks.navigate).toHaveBeenNthCalledWith(2, '/session/modify')
    })

    it('delegates home reset handler', () => {
        const { result } = renderHook(() => useResultViewLogic())

        act(() => {
            result.current.handleHome()
        })

        expect(mocks.resetHome).toHaveBeenCalledWith(mocks.navigate)
    })

    it('toggles expanded requirement id', () => {
        const { result } = renderHook(() => useResultViewLogic())

        act(() => {
            result.current.handleToggleRequirement('REQ-1')
        })
        expect(result.current.expandedRequirement).toBe('REQ-1')

        act(() => {
            result.current.handleToggleRequirement('REQ-1')
        })
        expect(result.current.expandedRequirement).toBe(null)
    })
})
