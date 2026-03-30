import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    deviceService: {
        clearDevice: vi.fn(),
    },
    sessionService: {
        clearSession: vi.fn(),
    },
}))

vi.mock('../DeviceService', () => ({
    default: mocks.deviceService,
}))

vi.mock('../SessionService', () => ({
    default: mocks.sessionService,
}))

import { resetSessionAndNavigateHome } from '../NavigationService'

describe('NavigationService', () => {
    it('clears stores and navigates to home', async () => {
        const navigate = vi.fn()
        mocks.deviceService.clearDevice.mockReset()
        mocks.sessionService.clearSession.mockReset()
        mocks.sessionService.clearSession.mockResolvedValue(undefined)

        await resetSessionAndNavigateHome(navigate)

        expect(mocks.deviceService.clearDevice).toHaveBeenCalledTimes(1)
        expect(mocks.sessionService.clearSession).toHaveBeenCalledTimes(1)
        expect(navigate).toHaveBeenCalledWith('/')
    })

    it('propagates clearSession error and does not navigate', async () => {
        const navigate = vi.fn()
        mocks.deviceService.clearDevice.mockReset()
        mocks.sessionService.clearSession.mockReset()
        mocks.sessionService.clearSession.mockRejectedValue(new Error('network error'))

        await expect(resetSessionAndNavigateHome(navigate)).rejects.toThrow('network error')
        expect(navigate).not.toHaveBeenCalled()
    })
})
