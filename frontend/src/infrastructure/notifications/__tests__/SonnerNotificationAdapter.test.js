import { describe, it, expect, vi, beforeEach } from 'vitest'
import SonnerNotificationAdapter from '@infrastructure/notifications/SonnerNotificationAdapter'

const mocks = vi.hoisted(() => ({
    notificationManager: {
        notifyError: vi.fn(),
        notifySuccess: vi.fn(),
    },
}))

vi.mock('../NotificationManager', () => ({
    default: mocks.notificationManager,
}))

describe('SonnerNotificationAdapter', () => {
    beforeEach(() => {
        mocks.notificationManager.notifyError.mockReset()
        mocks.notificationManager.notifySuccess.mockReset()
    })

    it('forwards errors to NotificationManager', () => {
        const error = new Error('oops')
        SonnerNotificationAdapter.notifyError(error, { id: 'X' })

        expect(mocks.notificationManager.notifyError).toHaveBeenCalledWith(error, { id: 'X' })
    })

    it('forwards success messages to NotificationManager', () => {
        SonnerNotificationAdapter.notifySuccess('ok')

        expect(mocks.notificationManager.notifySuccess).toHaveBeenCalledWith('ok')
    })
})
