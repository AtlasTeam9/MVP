import { describe, it, expect } from 'vitest'
import { Node, NodeType } from '../Node'

describe('NodeType', () => {
    it('contains expected constants', () => {
        expect(NodeType.QUESTION).toBe('QUESTION')
        expect(NodeType.RESULT).toBe('RESULT')
    })
})

describe('Node', () => {
    it('uses QUESTION as default type', () => {
        const node = new Node('n1', 'Is secure?', 'Question text')

        expect(node.id).toBe('n1')
        expect(node.text).toBe('Is secure?')
        expect(node.description).toBe('Question text')
        expect(node.type).toBe(NodeType.QUESTION)
    })

    it('supports custom type and null description', () => {
        const node = new Node('n2', 'Result node', null, NodeType.RESULT)

        expect(node.id).toBe('n2')
        expect(node.text).toBe('Result node')
        expect(node.description).toBeNull()
        expect(node.type).toBe(NodeType.RESULT)
    })

    it('maps backend payload with question field', () => {
        const node = Node.fromApi('node1', {
            question: 'Is network segmented?',
            description: 'Inspect VLANs',
        })

        expect(node).toBeInstanceOf(Node)
        expect(node.id).toBe('node1')
        expect(node.text).toBe('Is network segmented?')
        expect(node.description).toBe('Inspect VLANs')
        expect(node.type).toBe(NodeType.QUESTION)
    })

    it('maps backend payload with explicit result type', () => {
        const node = Node.fromApi('node2', {
            text: 'Requirement result',
            type: NodeType.RESULT,
        })

        expect(node.type).toBe(NodeType.RESULT)
    })
})
