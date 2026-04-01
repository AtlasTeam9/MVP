import { describe, it, expect } from 'vitest'
import { DecisionTree } from '@domain/DecisionTree'
import { Node } from '@domain/Node'

describe('DecisionTree', () => {
    it('creates a tree with default empty nodes map', () => {
        const tree = new DecisionTree('T-1', 'Base tree')

        expect(tree.id).toBe('T-1')
        expect(tree.title).toBe('Base tree')
        expect(tree.nodes).toEqual({})
        expect(tree.dependencies).toEqual([])
    })

    it('creates a tree with provided node map and dependencies', () => {
        const nodes = {
            n1: new Node('n1', 'Question 1'),
            n2: new Node('n2', 'Question 2'),
        }
        const tree = new DecisionTree('T-2', 'Tree with nodes', nodes, ['REQ-1'])

        expect(tree.id).toBe('T-2')
        expect(tree.title).toBe('Tree with nodes')
        expect(tree.nodes).toEqual(nodes)
        expect(tree.dependencies).toEqual(['REQ-1'])
        expect(tree.getNodeById('n1')).toBe(nodes.n1)
        expect(tree.getNodeById('missing')).toBeNull()
    })

    it('maps backend payload to DecisionTree and Node instances', () => {
        const tree = DecisionTree.fromApi({
            id: 'REQ-42',
            title: 'Network Security',
            dependencies: ['REQ-1'],
            nodes: {
                node1: { question: 'Is firewall enabled?', description: 'Check FW state' },
            },
        })

        expect(tree).toBeInstanceOf(DecisionTree)
        expect(tree.id).toBe('REQ-42')
        expect(tree.title).toBe('Network Security')
        expect(tree.dependencies).toEqual(['REQ-1'])
        expect(tree.getNodeById('node1')).toBeInstanceOf(Node)
        expect(tree.getNodeById('node1')?.text).toBe('Is firewall enabled?')
    })
})
