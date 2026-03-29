import { afterEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import { mapToAppError } from '../errorMapper'
import AppError from '../AppError'
import NetworkError from '../NetworkError'
import ValidationError from '../ValidationError'
import StateError from '../StateError'

// Unit tests

afterEach(() => {
    vi.restoreAllMocks()
})

describe('mapToAppError', () => {
    it('returns the same error when it is already an AppError', () => {
        const appError = new AppError('Errore custom', { code: 'CUSTOM_CODE' })

        const mapped = mapToAppError(appError)

        expect(mapped).toBe(appError)
    })

    it('maps axios error without response to NetworkError', () => {
        vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

        const axiosError = {
            isAxiosError: true,
            response: undefined,
        }

        const mapped = mapToAppError(axiosError)

        expect(mapped).toBeInstanceOf(NetworkError)
        expect(mapped.code).toBe('NETWORK_UNREACHABLE')
    })

    it('maps axios 422 response to ValidationError', () => {
        vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

        const axiosError = {
            isAxiosError: true,
            response: {
                status: 422,
                data: { detail: 'Campo obbligatorio mancante.' },
            },
        }

        const mapped = mapToAppError(axiosError)

        expect(mapped).toBeInstanceOf(ValidationError)
        expect(mapped.code).toBe('HTTP_422')
        expect(mapped.message).toBe('Campo obbligatorio mancante.')
    })

    it('maps generic Error to StateError', () => {
        vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)

        const mapped = mapToAppError(new Error('Errore locale'))

        expect(mapped).toBeInstanceOf(StateError)
        expect(mapped.code).toBe('UNEXPECTED_ERROR')
        expect(mapped.message).toBe('Errore locale')
    })
})
