import AppError from '@application/errors/AppError'

export default class ValidationError extends AppError {
    constructor(message = 'Dati non validi', options = {}) {
        super(message, { code: 'VALIDATION_ERROR', ...options })
    }
}