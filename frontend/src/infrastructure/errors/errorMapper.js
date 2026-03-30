import axios from 'axios'
import AppError from './AppError'
import NetworkError from './NetworkError'
import ValidationError from './ValidationError'
import StateError from './StateError'

const getApiMessage = (data) => {
    if (!data) return null

    if (typeof data === 'string') {
        return data
    }

    if (typeof data?.detail === 'string') {
        return data.detail
    }

    if (typeof data?.message === 'string') {
        return data.message
    }

    if (typeof data?.error === 'string') {
        return data.error
    }

    return null
}

export function mapToAppError(error) {
    if (error instanceof AppError) {
        return error
    }

    if (axios.isAxiosError(error)) {
        if (!error.response) {
            return new NetworkError('Unable to reach the server. Please check your connection.', {
                code: 'NETWORK_UNREACHABLE',
                cause: error,
            })
        }

        const status = error.response.status
        const apiMessage = getApiMessage(error.response.data)

        if (status === 400 || status === 422) {
            return new ValidationError(apiMessage || 'The provided data is not valid.', {
                code: `HTTP_${status}`,
                cause: error,
            })
        }

        if (status === 404) {
            return new StateError(apiMessage || 'Resource not found.', {
                code: 'HTTP_404',
                cause: error,
            })
        }

        if (status >= 500) {
            return new NetworkError(apiMessage || 'Internal server error.', {
                code: `HTTP_${status}`,
                cause: error,
            })
        }

        return new AppError(apiMessage || 'Unexpected error while communicating with the server.', {
            code: `HTTP_${status}`,
            cause: error,
        })
    }

    if (error instanceof Error) {
        return new StateError(error.message || 'Unexpected error.', {
            code: 'UNEXPECTED_ERROR',
            cause: error,
        })
    }

    return new AppError('Unknown error.', {
        code: 'UNKNOWN_ERROR',
        cause: error,
    })
}
