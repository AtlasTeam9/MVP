import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResultView from '@presentation/pages/ResultView'

const mocks = vi.hoisted(() => ({
    logic: {
        results: [],
        device: { assets: [{ id: 'a1', name: 'Asset 1' }] },
        resultsPerAsset: {},
        isTestFinished: false,
        isSessionUploaded: false,
        expandedRequirement: null,
        isExporting: false,
        isExportingSession: false,
        showFormatDialog: false,
        handleExportClick: vi.fn(),
        handleExportFormat: vi.fn(),
        handleExportSessionClick: vi.fn(),
        setShowFormatDialog: vi.fn(),
        handleResumeSession: vi.fn(),
        handleModifySession: vi.fn(),
        handleHome: vi.fn(),
        handleToggleRequirement: vi.fn(),
    },
}))

vi.mock('../../../application/hooks/useResultViewLogic', () => ({
    useResultViewLogic: () => mocks.logic,
}))

vi.mock('../../components/results/ResultItemView', () => ({
    ResultItemView: ({ item, onToggleExpand }) => (
        <button type="button" onClick={onToggleExpand}>
            {item.code}
        </button>
    ),
}))

vi.mock('../../components/results/AssetResultsView', () => ({
    AssetResultsView: ({ assets, requirementId, readOnly }) => (
        <div>
            Assets for {requirementId}: {assets?.length ?? 0} readOnly:{readOnly ? 'yes' : 'no'}
        </div>
    ),
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
        mocks.logic.results = []
        mocks.logic.device = { assets: [{ id: 'a1', name: 'Asset 1' }] }
        mocks.logic.resultsPerAsset = {}
        mocks.logic.expandedRequirement = null

        mocks.logic.handleToggleRequirement.mockReset()
        mocks.logic.handleResumeSession.mockReset()
        mocks.logic.handleModifySession.mockReset()
        mocks.logic.handleHome.mockReset()
    })

    it('shows fallback when there are no results', () => {
        render(<ResultView />)

        expect(screen.getByText('No results available')).toBeInTheDocument()
    })

    it('renders list and navigates on resume/modify actions', async () => {
        mocks.logic.results = [{ code: 'REQ1', status: 'PASS' }]
        mocks.logic.expandedRequirement = 'REQ1'

        render(<ResultView />)
        const user = userEvent.setup()

        expect(screen.getByText('Test Results')).toBeInTheDocument()
        expect(screen.getByText('REQ1')).toBeInTheDocument()

        await user.click(screen.getByText('REQ1'))
        expect(screen.getByText('Assets for REQ1: 1 readOnly:yes')).toBeInTheDocument()

        await user.click(screen.getByText('Resume'))
        await user.click(screen.getByText('Modify'))

        expect(mocks.logic.handleResumeSession).toHaveBeenCalledTimes(1)
        expect(mocks.logic.handleModifySession).toHaveBeenCalledTimes(1)
    })

    it('delegates home action to result logic', async () => {
        mocks.logic.results = [{ code: 'REQ1', status: 'PASS' }]

        render(<ResultView />)
        const user = userEvent.setup()

        await user.click(screen.getByText('Home'))

        await waitFor(() => {
            expect(mocks.logic.handleHome).toHaveBeenCalledTimes(1)
        })
    })
})


