import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBeforeUnload } from '../useBeforeUnload'

const mocks = vi.hoisted(() => ({
    sessionService: {
        getSessionId: vi.fn(),
        clearSession: vi.fn(),
    },
}))

vi.mock('../../services/SessionService', () => ({
    default: mocks.sessionService,
}))

describe('useBeforeUnload', () => {
    beforeEach(() => {
        mocks.sessionService.getSessionId.mockReset()
        mocks.sessionService.clearSession.mockReset()
        globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true }))
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('deletes remote session and clears local session on beforeunload', () => {
        mocks.sessionService.getSessionId.mockReturnValue('session-1')
        renderHook(() => useBeforeUnload())

        window.dispatchEvent(new Event('beforeunload'))

        expect(globalThis.fetch).toHaveBeenCalledTimes(1)
        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/session/session-1'),
            expect.objectContaining({ method: 'DELETE', keepalive: true })
        )
        expect(mocks.sessionService.clearSession).toHaveBeenCalledTimes(1)
    })

    it('clears local session without remote delete when sessionId is missing', () => {
        mocks.sessionService.getSessionId.mockReturnValue(null)
        renderHook(() => useBeforeUnload())

        window.dispatchEvent(new Event('beforeunload'))

        expect(globalThis.fetch).not.toHaveBeenCalled()
        expect(mocks.sessionService.clearSession).toHaveBeenCalledTimes(1)
    })
})
