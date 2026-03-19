import { describe, it, expect } from 'vitest'
import Asset, { AssetType } from '../Asset'

// Unit tests for AssetType
describe('AssetType — fromString()', () => {
    it('recognizes "network" (case-insensitive)', () => {
        expect(AssetType.fromString('network')).toBe(AssetType.NETWORK)
        expect(AssetType.fromString('Network')).toBe(AssetType.NETWORK)
        expect(AssetType.fromString('NETWORK')).toBe(AssetType.NETWORK)
    })

    it('recognizes "security" (case-insensitive)', () => {
        expect(AssetType.fromString('security')).toBe(AssetType.SECURITY)
        expect(AssetType.fromString('Security')).toBe(AssetType.SECURITY)
        expect(AssetType.fromString('SECURITY')).toBe(AssetType.SECURITY)
    })

    // TODO: aggiungere test quando si aggiungeranno altri tipi nella classe Asset

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
        const ass = new Asset('id-1', 'eth0', AssetType.NETWORK, true, 'Primary interface')
        expect(ass.id).toBe('id-1')
        expect(ass.name).toBe('eth0')
        expect(ass.type).toBe(AssetType.NETWORK)
        expect(ass.isSensitive).toBe(true)
        expect(ass.desc).toBe('Primary interface')
    })

    it('creates an Asset with optional values null', () => {
        const ass = new Asset('id-2', 'wlan0', AssetType.SECURITY, false)
        expect(ass.id).toBe('id-2')
        expect(ass.name).toBe('wlan0')
        expect(ass.type).toBe(AssetType.SECURITY)
        expect(ass.isSensitive).toBe(false)
        expect(ass.desc).toBeNull()
    })
})

// Unit tests for toDict() method
describe('Asset — toDict()', () => {
    it('serializes correctly all fields', () => {
        const ass = new Asset('id-1', 'eth0', AssetType.NETWORK, true, 'LAN')
        expect(ass.toDict()).toEqual({
            id: 'id-1',
            name: 'eth0',
            type: 'Network',
            isSensitive: true,
            desc: 'LAN',
        })
    })

    it('serializes with optional values null', () => {
        const ass = new Asset('id-2', 'wlan0', AssetType.SECURITY, false, null)
        const dict = ass.toDict()
        expect(dict.desc).toBeNull()
    })
})
