import { describe, it, expect } from 'vitest'
import { assetSchema } from '../schemas/AssetSchema'

const validAsset = {
    name: 'Firewall Rule Set',
    type: 'Security Function',
    isSensitive: true,
    desc: 'Main rule set',
}

describe('assetSchema', () => {
    it('accepts a valid asset', () => {
        const result = assetSchema.safeParse(validAsset)
        expect(result.success).toBe(true)
    })

    it('accepts an asset without optional description', () => {
        const result = assetSchema.safeParse({
            name: 'Network Config',
            type: 'Network Function Configuration',
            isSensitive: false,
        })

        expect(result.success).toBe(true)
    })

    it('fails if required name is missing', () => {
        const result = assetSchema.safeParse({
            type: 'Network Function',
            isSensitive: false,
        })

        expect(result.success).toBe(false)
    })

    it('fails if type is empty', () => {
        const result = assetSchema.safeParse({ ...validAsset, type: '' })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Type is required')
    })

    it('fails when isSensitive is not boolean', () => {
        const result = assetSchema.safeParse({ ...validAsset, isSensitive: 'yes' })
        expect(result.success).toBe(false)
    })
})
