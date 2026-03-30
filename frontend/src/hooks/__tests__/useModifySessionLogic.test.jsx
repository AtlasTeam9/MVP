import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useModifySessionLogic } from '../useModifySessionLogic'

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    resultState: {
        results: [
            { code: 'REQ-1', status: 'UNKNOWN' },
            { code: 'REQ-2', status: 'PASS' },
            { code: 'REQ-3', status: 'UNKNOWN' },
        ],
    },
    treeState: {
        trees: [
            { id: 'REQ-1', dependencies: [] },
            { id: 'REQ-2', dependencies: ['REQ-1'] },
            { id: 'REQ-3', dependencies: ['REQ-2'] },
        ],
    },
    deviceState: {
        currentDevice: {
            id: 'dev-1',
            assets: [{ id: 'asset-1', name: 'Asset 1' }],
        },
    },
    sessionState: {
        resultsPerAsset: {},
    },
    sessionService: {
        resumeSession: vi.fn(),
    },
}))

vi.mock('react-router-dom', () => ({
    useNavigate: () => mocks.navigate,
}))

vi.mock('../../store/ResultStore', () => ({
    default: (selector) => selector(mocks.resultState),
}))

vi.mock('../../store/TreeStore', () => ({
    default: (selector) => selector(mocks.treeState),
}))

vi.mock('../../store/DeviceStore', () => ({
    default: (selector) => selector(mocks.deviceState),
}))

vi.mock('../../store/SessionStore', () => ({
    default: (selector) => selector(mocks.sessionState),
}))

vi.mock('../../services/SessionService', () => ({
    default: mocks.sessionService,
}))

describe('useModifySessionLogic', () => {
    beforeEach(() => {
        mocks.navigate.mockReset()
        mocks.sessionService.resumeSession.mockReset()
        mocks.sessionService.resumeSession.mockReturnValue(true)
        mocks.resultState.results = [
            { code: 'REQ-1', status: 'UNKNOWN' },
            { code: 'REQ-2', status: 'PASS' },
            { code: 'REQ-3', status: 'UNKNOWN' },
        ]
        mocks.treeState.trees = [
            { id: 'REQ-1', dependencies: [] },
            { id: 'REQ-2', dependencies: ['REQ-1'] },
            { id: 'REQ-3', dependencies: ['REQ-2'] },
        ]
    })

    it('filters results to base requirements plus evaluated ones', () => {
        const { result } = renderHook(() => useModifySessionLogic())
        const filteredCodes = result.current.filteredResults.map((item) => item.code)

        expect(filteredCodes).toEqual(['REQ-1', 'REQ-2'])
    })

    it('toggles expanded requirement and clears selected asset', () => {
        const { result } = renderHook(() => useModifySessionLogic())

        act(() => {
            result.current.handleSelectAsset('asset-1')
            result.current.handleToggleRequirement('REQ-1')
        })

        expect(result.current.expandedRequirement).toBe('REQ-1')
        expect(result.current.selectedAsset).toBe(null)
    })

    it('resumes session and navigates when selection is valid', () => {
        const { result } = renderHook(() => useModifySessionLogic())

        act(() => {
            result.current.handleToggleRequirement('REQ-1')
            result.current.handleSelectAsset('asset-1')
        })

        act(() => {
            result.current.handleResumeTest()
        })

        expect(mocks.sessionService.resumeSession).toHaveBeenCalledWith('REQ-1', 'asset-1')
        expect(mocks.navigate).toHaveBeenCalledWith('/session/test')
    })
})
