import { describe, it, expect } from 'vitest'
import { calculateCompletionPercentage } from '../progressCalculator'

const trees = [
    { id: 'REQ-1', nodes: { node1: {}, node2: {} } },
    { id: 'REQ-2', nodes: { node1: {} } },
]

const assets = [{ id: 'A1' }, { id: 'A2' }]

describe('calculateCompletionPercentage', () => {
    it('returns 0 when trees or assets are missing', () => {
        expect(calculateCompletionPercentage(0, [], [], assets)).toBe(0)
        expect(calculateCompletionPercentage(0, [], trees, [])).toBe(0)
    })

    it('computes percentage using completed previous assets and trees', () => {
        expect(calculateCompletionPercentage(1, [], trees, assets, 0)).toBe(50)
    })

    it('adds partial progress for the current tree', () => {
        const pastHistory = [{ assetIndex: 1, treeIndex: 0, nodeId: 'node1' }]

        expect(calculateCompletionPercentage(1, pastHistory, trees, assets, 0)).toBe(62.5)
    })

    it('rounds result to one decimal digit', () => {
        const threeTrees = [
            { id: 'REQ-1', nodes: { n1: {}, n2: {}, n3: {} } },
            { id: 'REQ-2', nodes: { n1: {}, n2: {}, n3: {} } },
            { id: 'REQ-3', nodes: { n1: {}, n2: {}, n3: {} } },
        ]
        const oneAsset = [{ id: 'A1' }]
        const pastHistory = [{ assetIndex: 0, treeIndex: 1, nodeId: 'n1' }]

        expect(calculateCompletionPercentage(0, pastHistory, threeTrees, oneAsset, 1)).toBe(44.4)
    })

    it('does not double-count repeated answers on the same node', () => {
        const oneTreeThreeNodes = [{ id: 'REQ-1', nodes: { n1: {}, n2: {}, n3: {} } }]
        const oneAsset = [{ id: 'A1' }]
        const pastHistory = [
            { assetIndex: 0, treeIndex: 0, nodeId: 'n1' },
            { assetIndex: 0, treeIndex: 0, nodeId: 'n1' },
            { assetIndex: 0, treeIndex: 0, nodeId: 'n2' },
        ]

        expect(calculateCompletionPercentage(0, pastHistory, oneTreeThreeNodes, oneAsset, 0)).toBe(
            66.7
        )
    })

    it('counts same nodeId on different trees when current tree changes', () => {
        const twoTreesSameNodeIds = [
            { id: 'REQ-1', nodes: { node1: {}, node2: {} } },
            { id: 'REQ-2', nodes: { node1: {}, node2: {} } },
        ]
        const oneAsset = [{ id: 'A1' }]
        const pastHistory = [
            { assetIndex: 0, treeIndex: 0, nodeId: 'node1' },
            { assetIndex: 0, treeIndex: 1, nodeId: 'node1' },
        ]

        expect(
            calculateCompletionPercentage(0, pastHistory, twoTreesSameNodeIds, oneAsset, 1)
        ).toBe(75)
    })
})
