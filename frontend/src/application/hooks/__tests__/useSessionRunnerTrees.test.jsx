import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSessionRunnerTrees } from '@application/hooks/useSessionRunnerTrees'

const mocks = vi.hoisted(() => ({
    state: {
        trees: [{ id: 'REQ-1' }],
    },
    store: vi.fn((selector) => selector(mocks.state)),
}))

vi.mock('../../../state/TreeStore', () => ({
    default: (selector) => mocks.store(selector),
}))

describe('useSessionRunnerTrees', () => {
    it('returns trees selected from state', () => {
        const { result } = renderHook(() => useSessionRunnerTrees())

        expect(result.current).toEqual([{ id: 'REQ-1' }])
        expect(mocks.store).toHaveBeenCalledOnce()
    })
})
