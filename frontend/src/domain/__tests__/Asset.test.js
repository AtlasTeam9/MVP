import { describe, it, expect } from 'vitest'
import Asset, { AssetType } from '../Asset'

// Unit tests for AssetType
describe('AssetType — fromString()', () => {
    it('recognizes "network function" (case-insensitive)', () => {
        expect(AssetType.fromString('network function')).toBe(AssetType.NETWORK_FUNCTION)
        expect(AssetType.fromString('Network Function')).toBe(AssetType.NETWORK_FUNCTION)
        expect(AssetType.fromString('NETWORK FUNCTION')).toBe(AssetType.NETWORK_FUNCTION)
    })

    it('recognizes "security function" (case-insensitive)', () => {
        expect(AssetType.fromString('security function')).toBe(AssetType.SECURITY_FUNCTION)
        expect(AssetType.fromString('Security Function')).toBe(AssetType.SECURITY_FUNCTION)
        expect(AssetType.fromString('SECURITY FUNCTION')).toBe(AssetType.SECURITY_FUNCTION)
    })

    it('recognizes "network function configuration" (case-insensitive)', () => {
        expect(AssetType.fromString('network function configuration')).toBe(
            AssetType.NETWORK_FUNCTION_CONFIGURATION
        )
        expect(AssetType.fromString('Network Function Configuration')).toBe(
            AssetType.NETWORK_FUNCTION_CONFIGURATION
        )
        expect(AssetType.fromString('NETWORK FUNCTION CONFIGURATION')).toBe(
            AssetType.NETWORK_FUNCTION_CONFIGURATION
        )
    })

    it('recognizes "security parameter" (case-insensitive)', () => {
        expect(AssetType.fromString('security parameter')).toBe(AssetType.SECURITY_PARAMETER)
        expect(AssetType.fromString('Security Parameter')).toBe(AssetType.SECURITY_PARAMETER)
        expect(AssetType.fromString('SECURITY PARAMETER')).toBe(AssetType.SECURITY_PARAMETER)
    })

    it('throws an error for unknown type', () => {
        expect(() => AssetType.fromString('unknown')).toThrow('Unknown asset type: unknown')
    })

    it('throws an error for empty string', () => {
        expect(() => AssetType.fromString('')).toThrow()
    })
})

// Unit tests for constructor, getters, and setters
describe('Asset — constructor and getters', () => {
    it('creates an Asset with all fields', () => {
        const ass = new Asset('id-1', 'eth0', AssetType.NETWORK_FUNCTION, true, 'Primary interface')
        expect(ass.id).toBe('id-1')
        expect(ass.name).toBe('eth0')
        expect(ass.type).toBe(AssetType.NETWORK_FUNCTION)
        expect(ass.isSensitive).toBe(true)
        expect(ass.desc).toBe('Primary interface')
    })

    it('creates an Asset with optional values null', () => {
        const ass = new Asset('id-2', 'wlan0', AssetType.SECURITY_FUNCTION, false)
        expect(ass.id).toBe('id-2')
        expect(ass.name).toBe('wlan0')
        expect(ass.type).toBe(AssetType.SECURITY_FUNCTION)
        expect(ass.isSensitive).toBe(false)
        expect(ass.desc).toBeNull()
    })
})

// Unit tests for toDict() method
describe('Asset — toDict()', () => {
    it('serializes correctly all fields', () => {
        const ass = new Asset('id-1', 'eth0', AssetType.NETWORK_FUNCTION, true, 'LAN')
        expect(ass.toDict()).toEqual({
            id: 'id-1',
            name: 'eth0',
            type: AssetType.NETWORK_FUNCTION,
            'is_sensitive': true,
            description: 'LAN',
        })
    })

    it('serializes with optional values null', () => {
        const ass = new Asset('id-2', 'wlan0', AssetType.SECURITY_FUNCTION, false, null)
        const dict = ass.toDict()
        expect(dict.description).toBeNull()
    })
})
