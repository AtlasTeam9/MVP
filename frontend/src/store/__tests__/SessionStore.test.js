import { beforeEach, describe, expect, it } from 'vitest'
import useSessionStore from '../SessionStore'

function resetSessionStore() {
    beforeEach(() => {
        useSessionStore.getState().clearStore()
    })
}

describe('SessionStore selectAnswer - basic behavior', () => {
    resetSessionStore()

    it('adds an answer when none exists for current node', () => {
        useSessionStore.getState().setDevicePosition(0, 0, 'node1')

        useSessionStore.getState().selectAnswer(true)

        expect(useSessionStore.getState().pastHistory).toEqual([
            {
                nodeId: 'node1',
                answer: true,
                treeIndex: 0,
                assetIndex: 0,
            },
        ])
    })

    it('overwrites previous answer for the same asset/tree/node', () => {
        useSessionStore.getState().setDevicePosition(0, 0, 'node1')

        useSessionStore.getState().selectAnswer(true)
        useSessionStore.getState().selectAnswer(false)

        expect(useSessionStore.getState().pastHistory).toEqual([
            {
                nodeId: 'node1',
                answer: false,
                treeIndex: 0,
                assetIndex: 0,
            },
        ])
    })

})

describe('SessionStore selectAnswer - scope isolation', () => {
    resetSessionStore()

    it('keeps distinct answers for same node id in different trees/assets', () => {
        useSessionStore.getState().setDevicePosition(0, 0, 'node1')
        useSessionStore.getState().selectAnswer(true)

        useSessionStore.getState().setDevicePosition(0, 1, 'node1')
        useSessionStore.getState().selectAnswer(false)

        useSessionStore.getState().setDevicePosition(1, 0, 'node1')
        useSessionStore.getState().selectAnswer(true)

        expect(useSessionStore.getState().pastHistory).toEqual([
            {
                nodeId: 'node1',
                answer: true,
                treeIndex: 0,
                assetIndex: 0,
            },
            {
                nodeId: 'node1',
                answer: false,
                treeIndex: 1,
                assetIndex: 0,
            },
            {
                nodeId: 'node1',
                answer: true,
                treeIndex: 0,
                assetIndex: 1,
            },
        ])
    })
})
