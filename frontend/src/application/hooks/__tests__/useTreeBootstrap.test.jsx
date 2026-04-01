import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTreeBootstrap } from '@application/hooks/useTreeBootstrap'

const mocks = vi.hoisted(() => ({
    treeService: {
        loadTrees: vi.fn(),
    },
    notifications: {
        notifyError: vi.fn(),
    },
}))

vi.mock('../../services/TreeService', () => ({
    default: mocks.treeService,
}))

vi.mock('../../services/AppServices', () => ({
    notificationService: mocks.notifications,
}))

describe('useTreeBootstrap', () => {
    beforeEach(() => {
        mocks.treeService.loadTrees.mockReset()
        mocks.notifications.notifyError.mockReset()
    })

    it('loads trees on mount', async () => {
        mocks.treeService.loadTrees.mockResolvedValue(undefined)

        renderHook(() => useTreeBootstrap())

        await Promise.resolve()

        expect(mocks.treeService.loadTrees).toHaveBeenCalledOnce()
        expect(mocks.notifications.notifyError).not.toHaveBeenCalled()
    })

    it('notifies when loading trees fails', async () => {
        const error = new Error('failed to load')
        mocks.treeService.loadTrees.mockRejectedValue(error)

        renderHook(() => useTreeBootstrap())

        await Promise.resolve()
        await Promise.resolve()

        expect(mocks.notifications.notifyError).toHaveBeenCalledWith(error, {
            id: 'LOAD_TREES_ERROR',
        })
    })
})
