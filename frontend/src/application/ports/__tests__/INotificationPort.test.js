import { describe, it, expect } from 'vitest'
import { INotificationPort } from '@application/ports/INotificationPort'

describe('INotificationPort', () => {
    it('throws for notifyError when not implemented', () => {
        const port = new INotificationPort()

        expect(() => port.notifyError(new Error('x'))).toThrow(
            'INotificationPort.notifyError must be implemented'
        )
    })

    it('throws for notifySuccess when not implemented', () => {
        const port = new INotificationPort()

        expect(() => port.notifySuccess('ok')).toThrow(
            'INotificationPort.notifySuccess must be implemented'
        )
    })
})
