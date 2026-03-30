import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModifySessionView from '../ModifySessionView'

const mocks = vi.hoisted(() => ({
    logic: {
        filteredResults: [],
        expandedRequirement: null,
        device: null,
        resultsPerAsset: {},
        selectedAsset: null,
        handleToggleRequirement: vi.fn(),
        handleSelectAsset: vi.fn(),
        handleResumeTest: vi.fn(),
        handleBack: vi.fn(),
    },
    trees: [],
}))

vi.mock('../../hooks/useModifySessionLogic', () => ({
    useModifySessionLogic: () => mocks.logic,
}))

vi.mock('../../store/TreeStore', () => ({
    default: (selector) => selector({ trees: mocks.trees }),
}))

vi.mock('../../components/common/BackIcon', () => ({
    default: ({ onBack }) => (
        <button type="button" onClick={onBack}>
            Back
        </button>
    ),
}))

vi.mock('../../components/results/ResultItemView', () => ({
    ResultItemView: ({ item, onToggleExpand }) => (
        <button type="button" onClick={onToggleExpand}>
            Requirement {item.code}
        </button>
    ),
}))

vi.mock('../../components/results/AssetResultsView', () => ({
    AssetResultsView: ({ requirementId, dependencies }) => (
        <div>
            Assets for {requirementId} ({dependencies.length} deps)
        </div>
    ),
}))

describe('ModifySessionView', () => {
    beforeEach(() => {
        mocks.logic = {
            filteredResults: [],
            expandedRequirement: null,
            device: null,
            resultsPerAsset: {},
            selectedAsset: null,
            handleToggleRequirement: vi.fn(),
            handleSelectAsset: vi.fn(),
            handleResumeTest: vi.fn(),
            handleBack: vi.fn(),
        }
        mocks.trees = []
    })

    it('shows fallback when no base requirements are available', () => {
        render(<ModifySessionView />)

        expect(screen.getByText('No base requirements available')).toBeInTheDocument()
    })

    it('renders requirements and resume action state', async () => {
        mocks.logic.filteredResults = [{ code: 'REQ-1', status: 'PASS' }]

        render(<ModifySessionView />)
        const user = userEvent.setup()

        expect(screen.getByText('Requirement REQ-1')).toBeInTheDocument()

        const resumeButton = screen.getByText('Resume test from here')
        expect(resumeButton).toBeDisabled()

        await user.click(screen.getByText('Requirement REQ-1'))
        expect(mocks.logic.handleToggleRequirement).toHaveBeenCalledWith('REQ-1')
    })

    it('shows asset results on expanded requirement and resumes from selected asset', async () => {
        mocks.logic.filteredResults = [{ code: 'REQ-1', status: 'PASS' }]
        mocks.logic.expandedRequirement = 'REQ-1'
        mocks.logic.selectedAsset = 'a1'
        mocks.logic.device = { assets: [{ id: 'a1', name: 'Asset A' }] }
        mocks.trees = [{ id: 'REQ-1', dependencies: [{ id: 'REQ-0' }] }]

        render(<ModifySessionView />)
        const user = userEvent.setup()

        expect(screen.getByText('Assets for REQ-1 (1 deps)')).toBeInTheDocument()

        await user.click(screen.getByText('Resume test from here'))
        expect(mocks.logic.handleResumeTest).toHaveBeenCalledTimes(1)
    })
})
