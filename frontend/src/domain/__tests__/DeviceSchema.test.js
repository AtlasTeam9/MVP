import { describe, it, expect } from 'vitest'
import { deviceSchema } from '@domain/schemas/DeviceSchema'

// Create a valid device object to use in tests
const validDevice = {
    name: 'Router',
    operatingSystem: 'Linux',
    firmwareVersion: '1.0.0',
    functionalities: 'routing',
}

// Helper function to omit a specific key (field) from an object
function omit(obj, key) {
    const { [key]: omittedField, ...rest } = obj
    void omittedField
    return rest
}

// Unit tests for deviceSchema correct validation
describe('deviceSchema — correct validation', () => {
    it('accept a valid device with all required fields', () => {
        const result = deviceSchema.safeParse(validDevice)
        expect(result.success).toBe(true)
    })

    it('accept a valid device with optional description', () => {
        const result = deviceSchema.safeParse({ ...validDevice, description: 'A router' })
        expect(result.success).toBe(true)
    })

    it('accept an empty description (optional field)', () => {
        const result = deviceSchema.safeParse({ ...validDevice, description: '' })
        expect(result.success).toBe(true)
    })
})

// Unit tests for deviceSchema validation failures (missing required fields)
describe('deviceSchema — missing required fields', () => {
    it('fails if name is missing', () => {
        expect(deviceSchema.safeParse(omit(validDevice, 'name')).success).toBe(false)
    })

    it('fails if operatingSystem is missing', () => {
        expect(deviceSchema.safeParse(omit(validDevice, 'operatingSystem')).success).toBe(false)
    })

    it('fails if firmwareVersion is missing', () => {
        expect(deviceSchema.safeParse(omit(validDevice, 'firmwareVersion')).success).toBe(false)
    })

    it('fails if functionality is missing', () => {
        expect(deviceSchema.safeParse(omit(validDevice, 'functionalities')).success).toBe(false)
    })
})

// Unit tests for deviceSchema validation failures (empty strings for required fields)
describe('deviceSchema — missing required fields', () => {
    it('fails if name is an empty string', () => {
        const result = deviceSchema.safeParse({ ...validDevice, name: '' })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Name is required')
    })

    it('fails if operatingSystem is an empty string', () => {
        const result = deviceSchema.safeParse({ ...validDevice, operatingSystem: '' })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('OS is required')
    })

    it('fails if firmwareVersion is an empty string', () => {
        const result = deviceSchema.safeParse({ ...validDevice, firmwareVersion: '' })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Firmware version is required')
    })

    it('fails if functionality is an empty string', () => {
        const result = deviceSchema.safeParse({ ...validDevice, functionalities: '' })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Functionalities are required')
    })
})

// Unit tests for deviceSchema validation failures (length constraints)
describe('deviceSchema — length constraints', () => {
    it('fails if operatingSystem exceeds 30 characters', () => {
        const result = deviceSchema.safeParse({
            ...validDevice,
            operatingSystem: 'A'.repeat(31),
        })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('OS is too long')
    })

    it('accepts operatingSystem of exactly 30 characters', () => {
        const result = deviceSchema.safeParse({
            ...validDevice,
            operatingSystem: 'A'.repeat(30),
        })
        expect(result.success).toBe(true)
    })
})
