import { toast } from 'sonner'
import { mapToAppError } from '@infrastructure/errors/errorMapper'
import { getUserErrorMessage } from '@infrastructure/notifications/notificationMessages'

export class NotificationManager {
    constructor(toastInstance = toast) {
        this.toast = toastInstance
    }

    notifyError(error, options = {}) {
        const appError = mapToAppError(error)
        const message = getUserErrorMessage(appError)

        if (options.id) {
            this.toast.error(message, { id: options.id })
            return
        }

        this.toast.error(message)
    }

    notifySuccess(message) {
        this.toast.success(message)
    }
}

export default new NotificationManager()
