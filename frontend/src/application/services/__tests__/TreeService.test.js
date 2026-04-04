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
        clearStore: vi.fn(),
    },
}))

vi.mock('../AppServices', () => ({
    apiClientService: mocks.apiClient,
}))

vi.mock('../../../domain/DecisionTree', () => ({
    DecisionTree: mocks.decisionTree,
}))

vi.mock('../../../state/TreeStore', () => ({
    default: {
        getState: () => mocks.treeState,
    },
}))

import treeService from '@application/services/TreeService'

describe('TreeService', () => {
    beforeEach(() => {
        mocks.apiClient.get.mockReset()
        mocks.decisionTree.fromApi.mockReset()

        mocks.treeState = {
            setTrees: vi.fn(),
            clearStore: vi.fn(),
        }
    })

    it('loadTrees normalizes response and updates store', async () => {
        mocks.apiClient.get.mockResolvedValue([{ id: 't1' }, { id: 't2' }])
        mocks.decisionTree.fromApi.mockImplementation((tree) => ({ normalized: tree.id }))

        const result = await treeService.loadTrees()

        expect(mocks.decisionTree.fromApi).toHaveBeenCalledTimes(2)
        expect(mocks.treeState.setTrees).toHaveBeenCalledWith([
            { normalized: 't1' },
            { normalized: 't2' },
        ])
        expect(result).toEqual([{ normalized: 't1' }, { normalized: 't2' }])
    })

    it('loadTrees stores empty list when api response is not an array', async () => {
        mocks.apiClient.get.mockResolvedValue({ unexpected: true })

        const result = await treeService.loadTrees()

        expect(mocks.treeState.setTrees).toHaveBeenCalledWith([])
        expect(result).toEqual([])
    })

    it('loadTrees rethrows on failure', async () => {
        mocks.apiClient.get.mockRejectedValue(new Error('boom'))

        await expect(treeService.loadTrees()).rejects.toThrow('boom')
    })

    it('clearTrees clears tree store', () => {
        treeService.clearTrees()

        expect(mocks.treeState.clearStore).toHaveBeenCalledTimes(1)
    })
})




