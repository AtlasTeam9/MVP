import { beforeEach, describe, expect, it } from 'vitest'
import useResultStore from '../ResultStore'

describe('ResultStore', () => {
    beforeEach(() => {
        useResultStore.getState().clearStore()
    })

    it('sets and clears results', () => {
        const results = [{ id: 'r1' }, { id: 'r2' }]

        useResultStore.getState().setResults(results)
        expect(useResultStore.getState().results).toEqual(results)

        useResultStore.getState().clearStore()
        expect(useResultStore.getState().results).toEqual([])
    })
})
