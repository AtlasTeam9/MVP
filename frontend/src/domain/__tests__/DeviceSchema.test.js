import { describe, it, expect } from 'vitest'
import { deviceSchema } from '../schemas/DeviceSchema'

const validDevice = {
    name: 'Router',
    operatingSystem: 'Linux',
    firmwareVersion: '1.0.0',
    functionality: 'routing',
}

function omit(obj, key) {
    const { [key]: _, ...rest } = obj
    return rest
}

describe('deviceSchema — validazione corretta', () => {
    it('accetta un device valido con tutti i campi obbligatori', () => {
        const result = deviceSchema.safeParse(validDevice)
        expect(result.success).toBe(true)
    })

    it('accetta un device valido con description opzionale', () => {
        const result = deviceSchema.safeParse({ ...validDevice, description: 'A router' })
        expect(result.success).toBe(true)
    })

    it('accetta description vuota (campo opzionale)', () => {
        const result = deviceSchema.safeParse({ ...validDevice, description: '' })
        expect(result.success).toBe(true)
    })
})

describe('deviceSchema — campi obbligatori mancanti', () => {
    it('fallisce se name è assente', () => {
        expect(deviceSchema.safeParse(omit(validDevice, 'name')).success).toBe(false)
    })

    it('fallisce se name è stringa vuota', () => {
        const result = deviceSchema.safeParse({ ...validDevice, name: '' })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Name is required')
    })

    it('fallisce se operatingSystem è assente', () => {
        expect(deviceSchema.safeParse(omit(validDevice, 'operatingSystem')).success).toBe(false)
    })

    it('fallisce se operatingSystem è stringa vuota', () => {
        const result = deviceSchema.safeParse({ ...validDevice, operatingSystem: '' })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('OS is required')
    })

    it('fallisce se firmwareVersion è assente', () => {
        expect(deviceSchema.safeParse(omit(validDevice, 'firmwareVersion')).success).toBe(false)
    })

    it('fallisce se functionality è assente', () => {
        expect(deviceSchema.safeParse(omit(validDevice, 'functionality')).success).toBe(false)
    })
})

describe('deviceSchema — vincoli di lunghezza', () => {
    it('fallisce se operatingSystem supera 50 caratteri', () => {
        const result = deviceSchema.safeParse({
            ...validDevice,
            operatingSystem: 'A'.repeat(51),
        })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Too long')
    })

    it('accetta operatingSystem di esattamente 50 caratteri', () => {
        const result = deviceSchema.safeParse({
            ...validDevice,
            operatingSystem: 'A'.repeat(50),
        })
        expect(result.success).toBe(true)
    })
})
