import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    createNotificationService,
    default as NotificationService,
} from '@application/services/NotificationService'

const mocks = vi.hoisted(() => ({
    port: {
        notifyError: vi.fn(),
        notifySuccess: vi.fn(),
    },
}))

let service

describe('NotificationService', () => {
    beforeEach(() => {
        mocks.port.notifyError.mockReset()
        mocks.port.notifySuccess.mockReset()
        service = createNotificationService(mocks.port)
    })

    it('forwards errors to the configured port', () => {
        const error = new Error('boom')

        service.notifyError(error, { id: 'ERR' })

        expect(mocks.port.notifyError).toHaveBeenCalledWith(error, { id: 'ERR' })
    })

    it('forwards success messages to the configured port', () => {
        service.notifySuccess('ok')

        expect(mocks.port.notifySuccess).toHaveBeenCalledWith('ok')
    })

    it('rejects invalid ports', () => {
        expect(() => createNotificationService({})).toThrow(
            'Notification port must implement notifyError and notifySuccess'
        )
    })

    it('creates class instance from factory', () => {
        expect(service).toBeInstanceOf(NotificationService)
    })
})
