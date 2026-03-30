import { describe, expect, it, vi } from 'vitest'

import { clearLocalSessionState, deleteRemoteSessionIfPresent } from '../lifecycle'

describe('lifecycle helpers', () => {
    it('clearLocalSessionState clears both session and result stores', () => {
        const sessionState = { clearStore: vi.fn() }
        const resultState = { clearStore: vi.fn() }
        const sessionStore = {
            getState: () => sessionState,
        }
        const resultStore = {
            getState: () => resultState,
        }

        clearLocalSessionState(sessionStore, resultStore)

        expect(sessionState.clearStore).toHaveBeenCalledTimes(1)
        expect(resultState.clearStore).toHaveBeenCalledTimes(1)
    })

    it('deleteRemoteSessionIfPresent skips delete when no session id exists', async () => {
        const sessionStore = {
            getState: () => ({ sessionId: null }),
        }
        const apiClient = {
            delete: vi.fn(),
        }

        await deleteRemoteSessionIfPresent(sessionStore, apiClient)

        expect(apiClient.delete).not.toHaveBeenCalled()
    })

    it('deleteRemoteSessionIfPresent calls backend delete endpoint when session id exists', async () => {
        const sessionStore = {
            getState: () => ({ sessionId: 's-77' }),
        }
        const apiClient = {
            delete: vi.fn().mockResolvedValue({ ok: true }),
        }

        await deleteRemoteSessionIfPresent(sessionStore, apiClient)

        expect(apiClient.delete).toHaveBeenCalledWith('/session/s-77/delete')
    })
})
