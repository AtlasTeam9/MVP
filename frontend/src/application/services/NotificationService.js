import { INotificationPort } from '@application/ports/INotificationPort'

class NotificationService {
    constructor(port) {
        if (
            !port ||
            typeof port.notifyError !== 'function' ||
            typeof port.notifySuccess !== 'function'
        ) {
            throw new Error('Notification port must implement notifyError and notifySuccess')
        }

        this.port = port
    }

    notifyError(error, options = {}) {
        this.port.notifyError(error, options)
    }

    notifySuccess(message) {
        this.port.notifySuccess(message)
    }
}

export function createNotificationService(port) {
    return new NotificationService(port)
}

export default NotificationService
export { INotificationPort }
