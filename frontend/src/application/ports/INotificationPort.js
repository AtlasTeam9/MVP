export class INotificationPort {
    notifyError(...args) {
        void args
        throw new Error('INotificationPort.notifyError must be implemented')
    }

    notifySuccess(...args) {
        void args
        throw new Error('INotificationPort.notifySuccess must be implemented')
    }
}
