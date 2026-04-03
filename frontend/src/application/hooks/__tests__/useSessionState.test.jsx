import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import useSessionStore from '@state/SessionStore'
import { useSessionState } from '@application/hooks/sessionHooks/useSessionState'

describe('useSessionState', () => {
    beforeEach(() => {
        useSessionStore.getState().clearStore()
    })

    it('returns selected state from SessionStore', () => {
        useSessionStore.setState({
            sessionId: 'session-1',
            currentNode: { id: 'node1', text: 'Question?' },
            currentAssetIndex: 2,
            currentTreeIndex: 3,
            pastHistory: [{ nodeId: 'node1', answer: true, treeIndex: 3, assetIndex: 2 }],
            futureHistory: [{ nodeId: 'node2', answer: false, treeIndex: 3, assetIndex: 2 }],
            isTestFinished: true,
        })

        const { result } = renderHook(() => useSessionState())

        expect(result.current).toEqual({
            sessionId: 'session-1',
            currentNode: { id: 'node1', text: 'Question?' },
            currentAssetIndex: 2,
            currentTreeIndex: 3,
            pastHistory: [{ nodeId: 'node1', answer: true, treeIndex: 3, assetIndex: 2 }],
            futureHistory: [{ nodeId: 'node2', answer: false, treeIndex: 3, assetIndex: 2 }],
            isTestFinished: true,
        })
    })
})

