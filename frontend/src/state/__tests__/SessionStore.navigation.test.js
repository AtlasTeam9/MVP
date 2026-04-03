import { beforeEach, describe, expect, it } from 'vitest'
import useSessionStore from '@state/SessionStore'

describe('SessionStore navigation flow', () => {
    beforeEach(() => {
        useSessionStore.getState().clearStore()
    })

    it('moves backward and forward through history', () => {
        useSessionStore.getState().setDevicePosition(0, 0, 'node1')
        useSessionStore.getState().selectAnswer(true)

        useSessionStore.getState().setDevicePosition(0, 0, 'node2')
        useSessionStore.getState().selectAnswer(false)

        useSessionStore.getState().setDevicePosition(0, 0, 'node3')

        useSessionStore.getState().goToPreviousNode()
        let state = useSessionStore.getState()
        expect(state.currentNode).toEqual({ id: 'node2' })
        expect(state.futureHistory).toEqual([
            { nodeId: 'node3', answer: false, treeIndex: 0, assetIndex: 0 },
        ])

        useSessionStore.getState().goToPreviousNode()
        state = useSessionStore.getState()
        expect(state.currentNode).toEqual({ id: 'node1' })
        expect(state.futureHistory).toEqual([
            { nodeId: 'node2', answer: true, treeIndex: 0, assetIndex: 0 },
            { nodeId: 'node3', answer: false, treeIndex: 0, assetIndex: 0 },
        ])

        useSessionStore.getState().goToNextNode()
        state = useSessionStore.getState()
        expect(state.currentNode).toEqual({ id: 'node2' })
        expect(state.pastHistory).toEqual([
            { nodeId: 'node1', answer: null, treeIndex: 0, assetIndex: 0 },
        ])
    })
})
