import { describe, expect, it, vi } from 'vitest'
import AppError from '../../errors/AppError'
import { NotificationManager } from '../NotificationManager'
import { getUserErrorMessage } from '../notificationMessages'

// Unit tests

describe('NotificationManager', () => {
    it('shows mapped user-friendly message for known error code', () => {
        const toastMock = { error: vi.fn(), success: vi.fn() }
        const manager = new NotificationManager(toastMock)
        const error = new AppError('Messaggio tecnico', { code: 'NETWORK_UNREACHABLE' })

        manager.notifyError(error)

        expect(toastMock.error).toHaveBeenCalledWith(getUserErrorMessage(error))
    })

    it('falls back to error message when code is not mapped', () => {
        const toastMock = { error: vi.fn(), success: vi.fn() }
        const manager = new NotificationManager(toastMock)

        manager.notifyError(new AppError('Messaggio originale', { code: 'UNMAPPED_CODE' }))

        expect(toastMock.error).toHaveBeenCalledWith('Messaggio originale')
    })

    it('passes an explicit toast id when provided', () => {
        const toastMock = { error: vi.fn(), success: vi.fn() }
        const manager = new NotificationManager(toastMock)
        const error = new AppError('Messaggio tecnico', { code: 'NETWORK_UNREACHABLE' })

        manager.notifyError(error, { id: 'LOAD_TREES_ERROR' })

        expect(toastMock.error).toHaveBeenCalledWith(getUserErrorMessage(error), {
            id: 'LOAD_TREES_ERROR',
        })
    })

    it('shows success notification', () => {
        const toastMock = { error: vi.fn(), success: vi.fn() }
        const manager = new NotificationManager(toastMock)

        manager.notifySuccess('Operazione completata.')

        expect(toastMock.success).toHaveBeenCalledWith('Operazione completata.')
    })
})
