
/* eslint-disable camelcase */
import { beforeEach, describe, expect, it } from 'vitest'
import useSessionStore from '../SessionStore'

describe('SessionStore history utilities', () => {
    beforeEach(() => {
        useSessionStore.getState().clearStore()
    })

    it('truncates history by node id', () => {
        useSessionStore.setState({
            pastHistory: [
                { nodeId: 'node1', answer: true, treeIndex: 0, assetIndex: 0 },
                { nodeId: 'node2', answer: false, treeIndex: 0, assetIndex: 0 },
                { nodeId: 'node3', answer: true, treeIndex: 0, assetIndex: 0 },
            ],
        })

        useSessionStore.getState().truncateHistory('node2')
        expect(useSessionStore.getState().pastHistory).toEqual([
            { nodeId: 'node1', answer: true, treeIndex: 0, assetIndex: 0 },
        ])
    })

    it('truncates history by asset/tree position', () => {
        useSessionStore.setState({
            pastHistory: [
                { nodeId: 'node1', answer: true, treeIndex: 0, assetIndex: 0 },
                { nodeId: 'node2', answer: false, treeIndex: 1, assetIndex: 0 },
                { nodeId: 'node3', answer: true, treeIndex: 0, assetIndex: 1 },
                { nodeId: 'node4', answer: true, treeIndex: 2, assetIndex: 1 },
            ],
        })

        useSessionStore.getState().truncateHistoryByPosition(1, 1)
        expect(useSessionStore.getState().pastHistory).toEqual([
            { nodeId: 'node1', answer: true, treeIndex: 0, assetIndex: 0 },
            { nodeId: 'node2', answer: false, treeIndex: 1, assetIndex: 0 },
            { nodeId: 'node3', answer: true, treeIndex: 0, assetIndex: 1 },
        ])
    })

    it('imports past history from API shape', () => {
        const answers = [
            { asset_index: 0, tree_index: 1, node_id: 'node1', answer: false },
            { asset_index: 1, tree_index: 0, node_id: 'node2', answer: true },
        ]

        useSessionStore.getState().importPastHistory(answers)
        expect(useSessionStore.getState().pastHistory).toEqual([
            { assetIndex: 0, treeIndex: 1, nodeId: 'node1', answer: false },
            { assetIndex: 1, treeIndex: 0, nodeId: 'node2', answer: true },
        ])
    })

    it('sets the position from a saved state', () => {
        useSessionStore.getState().setPosition({
            assetIndex: 2,
            treeIndex: 3,
            nodeId: 'node9',
        })

        const state = useSessionStore.getState()
        expect(state.currentAssetIndex).toBe(2)
        expect(state.currentTreeIndex).toBe(3)
        expect(state.currentNode).toEqual({ id: 'node9' })
    })
})
