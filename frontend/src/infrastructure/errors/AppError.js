export default class AppError extends Error {
    constructor(message, { code = 'APP_ERROR', cause = null, context = {} } = {}) {
        super(message)
        this.name = this.constructor.name
        this.code = code
        this.cause = cause
        this.context = context
    }
}
