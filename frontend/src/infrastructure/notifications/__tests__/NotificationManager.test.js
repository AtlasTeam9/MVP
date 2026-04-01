import { describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import AppError from '@application/errors/AppError'
import { NotificationManager } from '@infrastructure/notifications/NotificationManager'
import { getUserErrorMessage } from '@infrastructure/notifications/notificationMessages'

// Unit tests

describe('NotificationManager - basic behavior', () => {
    it('shows mapped user-friendly message for known error code', () => {
        const toastMock = { error: vi.fn(), success: vi.fn() }
        const manager = new NotificationManager(toastMock)
        const error = new AppError('Technical message', { code: 'NETWORK_UNREACHABLE' })

        manager.notifyError(error)

        expect(toastMock.error).toHaveBeenCalledWith(getUserErrorMessage(error))
    })

    it('falls back to error message when code is not mapped', () => {
        const toastMock = { error: vi.fn(), success: vi.fn() }
        const manager = new NotificationManager(toastMock)

        manager.notifyError(new AppError('Original message', { code: 'UNMAPPED_CODE' }))

        expect(toastMock.error).toHaveBeenCalledWith('Original message')
    })

    it('passes an explicit toast id when provided', () => {
        const toastMock = { error: vi.fn(), success: vi.fn() }
        const manager = new NotificationManager(toastMock)
        const error = new AppError('Technical message', { code: 'NETWORK_UNREACHABLE' })

        manager.notifyError(error, { id: 'LOAD_TREES_ERROR' })

        expect(toastMock.error).toHaveBeenCalledWith(getUserErrorMessage(error), {
            id: 'LOAD_TREES_ERROR',
        })
    })

    it('shows success notification', () => {
        const toastMock = { error: vi.fn(), success: vi.fn() }
        const manager = new NotificationManager(toastMock)

        manager.notifySuccess('Operation completed.')

        expect(toastMock.success).toHaveBeenCalledWith('Operation completed.')
    })
})

describe('NotificationManager - backend error pipeline', () => {
    it.each([
        [
            'network unreachable',
            { isAxiosError: true, response: undefined },
            'Unable to reach the server. Please check your connection.',
        ],
        [
            'http 400',
            { isAxiosError: true, response: { status: 400, data: { detail: 'Bad request payload' } } },
            'Invalid request. Please verify the provided data.',
        ],
        [
            'http 404',
            { isAxiosError: true, response: { status: 404, data: {} } },
            'Resource not found.',
        ],
        [
            'http 422',
            { isAxiosError: true, response: { status: 422, data: { detail: 'Schema invalid' } } },
            'The uploaded file is not valid.',
        ],
        [
            'http 500',
            { isAxiosError: true, response: { status: 500, data: { detail: 'Internal error' } } },
            'Internal server error. Please try again later.',
        ],
    ])(
        'maps %s backend error to user-facing notification message',
        (_, backendLikeError, expectedMessage) => {
            const toastMock = { error: vi.fn(), success: vi.fn() }
            const manager = new NotificationManager(toastMock)
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

            manager.notifyError(backendLikeError)

            expect(toastMock.error).toHaveBeenCalledWith(expectedMessage)
        }
    )
})
