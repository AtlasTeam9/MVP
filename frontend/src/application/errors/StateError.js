import AppError from '@application/errors/AppError'

export default class StateError extends AppError {
    constructor(message = 'Stato applicativo non valido', options = {}) {
        super(message, { code: 'STATE_ERROR', ...options })
    }
}