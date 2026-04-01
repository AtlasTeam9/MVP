import { describe, it, expect } from 'vitest'
import { selectRouteAccess, selectSessionRunnerTrees } from '@state/selectors/compositeSelectors'

describe('compositeSelectors', () => {
    describe('selectRouteAccess', () => {
        it('returns true for protected route only with session and device by default', () => {
            expect(selectRouteAccess('session-1', { id: 'dev-1' })).toBe(true)
            expect(selectRouteAccess(null, { id: 'dev-1' })).toBe(false)
            expect(selectRouteAccess('session-1', null)).toBe(false)
        })

        it('returns true only when device exists if session id is not required', () => {
            expect(selectRouteAccess(null, { id: 'dev-1' }, false)).toBe(true)
            expect(selectRouteAccess(null, null, false)).toBe(false)
        })
    })

    describe('selectSessionRunnerTrees', () => {
        it('returns trees from state', () => {
            const state = { trees: [{ id: 'REQ-1' }, { id: 'REQ-2' }] }
            expect(selectSessionRunnerTrees(state)).toEqual(state.trees)
        })
    })
})
