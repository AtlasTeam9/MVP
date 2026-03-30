import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    apiClient: {
        get: vi.fn(),
    },
    decisionTree: {
        fromApi: vi.fn(),
    },
    treeState: {
        setTrees: vi.fn(),
        setError: vi.fn(),
        clearStore: vi.fn(),
    },
    uiState: {
        setTreeLoading: vi.fn(),
    },
}))

vi.mock('../../infrastructure/api/AxiosApiClient', () => ({
    default: mocks.apiClient,
}))

vi.mock('../../domain/DecisionTree', () => ({
    DecisionTree: mocks.decisionTree,
}))

vi.mock('../../store/TreeStore', () => ({
    default: {
        getState: () => mocks.treeState,
    },
}))

vi.mock('../../store/UIStore', () => ({
    default: {
        getState: () => mocks.uiState,
    },
}))

import treeService from '../TreeService'

describe('TreeService', () => {
    beforeEach(() => {
        mocks.apiClient.get.mockReset()
        mocks.decisionTree.fromApi.mockReset()

        mocks.treeState = {
            setTrees: vi.fn(),
            setError: vi.fn(),
            clearStore: vi.fn(),
        }

        mocks.uiState = {
            setTreeLoading: vi.fn(),
        }
    })

    it('loadTrees normalizes response, updates store and loading state', async () => {
        mocks.apiClient.get.mockResolvedValue([{ id: 't1' }, { id: 't2' }])
        mocks.decisionTree.fromApi.mockImplementation((tree) => ({ normalized: tree.id }))

        const result = await treeService.loadTrees()

        expect(mocks.uiState.setTreeLoading).toHaveBeenNthCalledWith(1, true)
        expect(mocks.decisionTree.fromApi).toHaveBeenCalledTimes(2)
        expect(mocks.treeState.setTrees).toHaveBeenCalledWith([
            { normalized: 't1' },
            { normalized: 't2' },
        ])
        expect(mocks.treeState.setError).toHaveBeenCalledWith(null)
        expect(mocks.uiState.setTreeLoading).toHaveBeenLastCalledWith(false)
        expect(result).toEqual([{ normalized: 't1' }, { normalized: 't2' }])
    })

    it('loadTrees stores empty list when api response is not an array', async () => {
        mocks.apiClient.get.mockResolvedValue({ unexpected: true })

        const result = await treeService.loadTrees()

        expect(mocks.treeState.setTrees).toHaveBeenCalledWith([])
        expect(result).toEqual([])
    })

    it('loadTrees stores error message and rethrows on failure', async () => {
        mocks.apiClient.get.mockRejectedValue(new Error('boom'))

        await expect(treeService.loadTrees()).rejects.toThrow('boom')
        expect(mocks.treeState.setError).toHaveBeenCalledWith('boom')
        expect(mocks.uiState.setTreeLoading).toHaveBeenLastCalledWith(false)
    })

    it('clearTrees clears tree store', () => {
        treeService.clearTrees()

        expect(mocks.treeState.clearStore).toHaveBeenCalledTimes(1)
    })
})
