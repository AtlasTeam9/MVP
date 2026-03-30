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

    it('computes percentage including completed previous assets', () => {
        const pastHistory = [{ assetIndex: 1, nodeId: 'node1' }]

        expect(calculateCompletionPercentage(1, pastHistory, trees, assets)).toBe(66.7)
    })

    it('rounds result to one decimal digit', () => {
        const oneTreeThreeNodes = [{ id: 'REQ-1', nodes: { n1: {}, n2: {}, n3: {} } }]
        const oneAsset = [{ id: 'A1' }]
        const pastHistory = [{ assetIndex: 0, nodeId: 'n1' }]

        expect(
            calculateCompletionPercentage(0, pastHistory, oneTreeThreeNodes, oneAsset)
        ).toBe(33.3)
    })

    it('does not double-count repeated answers on the same node', () => {
        const oneTreeThreeNodes = [{ id: 'REQ-1', nodes: { n1: {}, n2: {}, n3: {} } }]
        const oneAsset = [{ id: 'A1' }]
        const pastHistory = [
            { assetIndex: 0, nodeId: 'n1' },
            { assetIndex: 0, nodeId: 'n1' },
            { assetIndex: 0, nodeId: 'n2' },
        ]

        expect(
            calculateCompletionPercentage(0, pastHistory, oneTreeThreeNodes, oneAsset)
        ).toBe(66.7)
    })
})
