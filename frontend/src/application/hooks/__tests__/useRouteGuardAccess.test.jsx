import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRouteGuardAccess } from '@application/hooks/useRouteGuardAccess'

const mocks = vi.hoisted(() => ({
    sessionState: { sessionId: null },
    deviceState: { currentDevice: null },
}))

vi.mock('../../../state/SessionStore', () => ({
    default: (selector) => selector(mocks.sessionState),
}))

vi.mock('../../../state/DeviceStore', () => ({
    default: (selector) => selector(mocks.deviceState),
}))

describe('useRouteGuardAccess', () => {
    beforeEach(() => {
        mocks.sessionState.sessionId = null
        mocks.deviceState.currentDevice = null
    })

    it('allows unprotected routes', () => {
        const { result } = renderHook(() =>
            useRouteGuardAccess({ isProtected: false, requiresSessionId: true })
        )

        expect(result.current).toBe(true)
    })

    it('requires only device when requiresSessionId is false', () => {
        mocks.deviceState.currentDevice = { id: 'dev-1' }

        const { result } = renderHook(() =>
            useRouteGuardAccess({ isProtected: true, requiresSessionId: false })
        )

        expect(result.current).toBe(true)
    })

    it('requires session and device by default for protected routes', () => {
        mocks.sessionState.sessionId = 'session-1'
        mocks.deviceState.currentDevice = { id: 'dev-1' }

        const { result } = renderHook(() => useRouteGuardAccess({ isProtected: true }))

        expect(result.current).toBe(true)
    })

    it('denies protected routes when prerequisites are missing', () => {
        const { result } = renderHook(() => useRouteGuardAccess({ isProtected: true }))

        expect(result.current).toBe(false)
    })
})
