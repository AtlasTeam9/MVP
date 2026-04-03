import AppError from '@application/errors/AppError'

export default class NetworkError extends AppError {
    constructor(message = 'Errore di rete', options = {}) {
        super(message, { code: 'NETWORK_ERROR', ...options })
    }
}