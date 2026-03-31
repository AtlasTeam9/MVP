import { beforeEach, describe, expect, it } from 'vitest'
import useTreeStore from '../TreeStore'
import { DecisionTree } from '../../domain/DecisionTree'

const apiTree = {
    id: 'tree-1',
    title: 'Tree 1',
    nodes: {
        node1: { text: 'Q1' },
    },
}

describe('TreeStore', () => {
    beforeEach(() => {
        useTreeStore.getState().clearStore()
    })

    it('normalizes trees from API data', () => {
        useTreeStore.getState().setTrees([apiTree])

        const node = useTreeStore.getState().getNodeByTreeIndexAndNodeId(0, 'node1')
        expect(node.id).toBe('node1')
        expect(node.text).toBe('Q1')
    })

    it('accepts DecisionTree instances without remapping', () => {
        const tree = new DecisionTree('tree-2', 'Tree 2', { node2: { id: 'node2', text: 'Q2' } })
        useTreeStore.getState().setTrees([tree])

        const node = useTreeStore.getState().getNodeByTreeIndexAndNodeId(0, 'node2')
        expect(node.id).toBe('node2')
        expect(node.text).toBe('Q2')
    })

    it('supports legacy tree structures without getNodeById', () => {
        const legacyTree = {
            nodes: {
                node3: { question: 'Q3', type: 'QUESTION' },
            },
        }

        useTreeStore.setState({ trees: [legacyTree] })
        const node = useTreeStore.getState().getNodeByTreeIndexAndNodeId(0, 'node3')

        expect(node.id).toBe('node3')
        expect(node.text).toBe('Q3')
    })
})
