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
            return new NetworkError('Impossibile contattare il server. Controlla la connessione.', {
                code: 'NETWORK_UNREACHABLE',
                cause: error,
            })
        }

        const status = error.response.status
        const apiMessage = getApiMessage(error.response.data)

        if (status === 400 || status === 422) {
            return new ValidationError(apiMessage || 'I dati inviati non sono validi.', {
                code: `HTTP_${status}`,
                cause: error,
            })
        }

        if (status === 404) {
            return new StateError(apiMessage || 'Risorsa non trovata.', {
                code: 'HTTP_404',
                cause: error,
            })
        }

        if (status >= 500) {
            return new NetworkError(apiMessage || 'Errore interno del server.', {
                code: `HTTP_${status}`,
                cause: error,
            })
        }

        return new AppError(apiMessage || 'Errore inatteso nella comunicazione con il server.', {
            code: `HTTP_${status}`,
            cause: error,
        })
    }

    if (error instanceof Error) {
        return new StateError(error.message || 'Errore inatteso.', {
            code: 'UNEXPECTED_ERROR',
            cause: error,
        })
    }

    return new AppError('Errore sconosciuto.', {
        code: 'UNKNOWN_ERROR',
        cause: error,
    })
}
