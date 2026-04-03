import NotificationManager from '@infrastructure/notifications/NotificationManager'

export class SonnerNotificationAdapter {
    notifyError(error, options = {}) {
        NotificationManager.notifyError(error, options)
    }

    notifySuccess(message) {
        NotificationManager.notifySuccess(message)
    }
}

export default new SonnerNotificationAdapter()
