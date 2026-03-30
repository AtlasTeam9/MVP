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

function mockAxiosError(error) {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    return {
        isAxiosError: true,
        ...error,
    }
}

describe('mapToAppError - base cases', () => {
    it('returns the same error when it is already an AppError', () => {
        const appError = new AppError('Custom error', { code: 'CUSTOM_CODE' })

        const mapped = mapToAppError(appError)

        expect(mapped).toBe(appError)
    })

    it('maps axios error without response to NetworkError', () => {
        const axiosError = mockAxiosError({ response: undefined })

        const mapped = mapToAppError(axiosError)

        expect(mapped).toBeInstanceOf(NetworkError)
        expect(mapped.code).toBe('NETWORK_UNREACHABLE')
    })
})

describe('mapToAppError - validation/state status mapping', () => {
    it('maps axios 400 response to ValidationError', () => {
        const axiosError = mockAxiosError({
            response: {
                status: 400,
                data: { detail: 'Payload non valido.' },
            },
        })

        const mapped = mapToAppError(axiosError)

        expect(mapped).toBeInstanceOf(ValidationError)
        expect(mapped.code).toBe('HTTP_400')
        expect(mapped.message).toBe('Payload non valido.')
    })

    it('maps axios 422 response to ValidationError', () => {
        const axiosError = mockAxiosError({
            response: {
                status: 422,
                data: { message: 'Campo obbligatorio mancante.' },
            },
        })

        const mapped = mapToAppError(axiosError)

        expect(mapped).toBeInstanceOf(ValidationError)
        expect(mapped.code).toBe('HTTP_422')
        expect(mapped.message).toBe('Campo obbligatorio mancante.')
    })

    it('maps axios 404 response to StateError', () => {
        const axiosError = mockAxiosError({
            response: {
                status: 404,
                data: {},
            },
        })

        const mapped = mapToAppError(axiosError)

        expect(mapped).toBeInstanceOf(StateError)
        expect(mapped.code).toBe('HTTP_404')
        expect(mapped.message).toBe('Resource not found.')
    })
})

describe('mapToAppError - server and fallback status mapping', () => {
    it('maps axios 500 response to NetworkError', () => {
        const axiosError = mockAxiosError({
            response: {
                status: 500,
                data: { error: 'Backend error.' },
            },
        })

        const mapped = mapToAppError(axiosError)

        expect(mapped).toBeInstanceOf(NetworkError)
        expect(mapped.code).toBe('HTTP_500')
        expect(mapped.message).toBe('Backend error.')
    })

    it('maps non-managed axios status to AppError fallback', () => {
        const axiosError = mockAxiosError({
            response: {
                status: 418,
                data: 'Unexpected response',
            },
        })

        const mapped = mapToAppError(axiosError)

        expect(mapped).toBeInstanceOf(AppError)
        expect(mapped.code).toBe('HTTP_418')
        expect(mapped.message).toBe('Unexpected response')
    })
})

describe('mapToAppError - fallback mapping', () => {
    it('maps generic Error to StateError', () => {
        vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)

        const mapped = mapToAppError(new Error('Local error'))

        expect(mapped).toBeInstanceOf(StateError)
        expect(mapped.code).toBe('UNEXPECTED_ERROR')
        expect(mapped.message).toBe('Local error')
    })

    it('maps non-Error unknown values to AppError unknown', () => {
        vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)

        const mapped = mapToAppError('unexpected value')

        expect(mapped).toBeInstanceOf(AppError)
        expect(mapped.code).toBe('UNKNOWN_ERROR')
    })
})
