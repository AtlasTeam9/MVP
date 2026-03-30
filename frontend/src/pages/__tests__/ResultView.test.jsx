import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResultView from '../ResultView'

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    resultState: {
        results: [],
    },
    sessionState: {
        sessionId: 'session-1',
        isTestFinished: false,
        isSessionUploaded: false,
    },
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
    clearDevice: vi.fn(),
    clearSession: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => mocks.navigate,
    }
})

vi.mock('../../store/ResultStore', () => ({
    default: (selector) => selector(mocks.resultState),
}))

vi.mock('../../store/SessionStore', () => ({
    default: (selector) => selector(mocks.sessionState),
}))

vi.mock('../../hooks/useExportResults', () => ({
    useExportResults: () => mocks.exportResults,
}))

vi.mock('../../hooks/useExportSession', () => ({
    useExportSession: () => mocks.exportSession,
}))

vi.mock('../../services/DeviceService', () => ({
    default: {
        clearDevice: mocks.clearDevice,
    },
}))

vi.mock('../../services/SessionService', () => ({
    default: {
        clearSession: mocks.clearSession,
    },
}))

vi.mock('../../components/results/ResultListView', () => ({
    ResultListView: ({ items }) => <div>List size: {items.length}</div>,
}))

vi.mock('../../components/results/ResultActions', () => ({
    ResultActions: ({ onResumeSession, onModifySession, onHome }) => (
        <div>
            <button type="button" onClick={onResumeSession}>
                Resume
            </button>
            <button type="button" onClick={onModifySession}>
                Modify
            </button>
            <button type="button" onClick={onHome}>
                Home
            </button>
        </div>
    ),
}))

describe('ResultView', () => {
    beforeEach(() => {
        mocks.navigate.mockReset()
        mocks.clearDevice.mockReset()
        mocks.clearSession.mockReset()
        mocks.clearSession.mockResolvedValue(undefined)

        mocks.resultState = {
            results: [],
        }

        mocks.sessionState = {
            sessionId: 'session-1',
            isTestFinished: false,
            isSessionUploaded: false,
        }
    })

    it('shows fallback when there are no results', () => {
        render(<ResultView />)

        expect(screen.getByText('No results available')).toBeInTheDocument()
    })

    it('renders list and navigates on resume/modify actions', async () => {
        mocks.resultState.results = [{ code: 'REQ1', status: 'PASS' }]

        render(<ResultView />)
        const user = userEvent.setup()

        expect(screen.getByText('Test Results')).toBeInTheDocument()
        expect(screen.getByText('List size: 1')).toBeInTheDocument()

        await user.click(screen.getByText('Resume'))
        await user.click(screen.getByText('Modify'))

        expect(mocks.navigate).toHaveBeenCalledWith('/session/test')
        expect(mocks.navigate).toHaveBeenCalledWith('/session/modify')
    })

    it('clears local state and navigates home', async () => {
        mocks.resultState.results = [{ code: 'REQ1', status: 'PASS' }]

        render(<ResultView />)
        const user = userEvent.setup()

        await user.click(screen.getByText('Home'))

        await waitFor(() => {
            expect(mocks.clearDevice).toHaveBeenCalledTimes(1)
            expect(mocks.clearSession).toHaveBeenCalledTimes(1)
            expect(mocks.navigate).toHaveBeenCalledWith('/')
        })
    })
})
