import { describe, it, expect } from 'vitest'
import Asset, { AssetType } from '../Asset'

describe('AssetType — fromString()', () => {
    it('riconosce "network" (case-insensitive)', () => {
        expect(AssetType.fromString('network')).toBe(AssetType.NETWORK)
        expect(AssetType.fromString('Network')).toBe(AssetType.NETWORK)
        expect(AssetType.fromString('NETWORK')).toBe(AssetType.NETWORK)
    })

    it('riconosce "security" (case-insensitive)', () => {
        expect(AssetType.fromString('security')).toBe(AssetType.SECURITY)
        expect(AssetType.fromString('Security')).toBe(AssetType.SECURITY)
    })

    it('lancia un errore per tipo sconosciuto', () => {
        expect(() => AssetType.fromString('unknown')).toThrow('Unknown asset type: unknown')
    })

    it('lancia un errore per stringa vuota', () => {
        expect(() => AssetType.fromString('')).toThrow()
    })
})

describe('Asset — costruttore e getter', () => {
    it('crea un Asset con tutti i campi', () => {
        const ass = new Asset('id-1', 'eth0', AssetType.NETWORK, true, 'Primary interface')
        expect(ass.id).toBe('id-1')
        expect(ass.name).toBe('eth0')
    })

    it('crea un Asset con valori opzionali null', () => {
        const ass = new Asset('id-2', 'wlan0', AssetType.SECURITY)
        expect(ass.id).toBe('id-2')
        expect(ass.name).toBe('wlan0')
    })

    it('permette di modificare il nome tramite setter', () => {
        const ass = new Asset('id-1', 'eth0', AssetType.NETWORK)
        ass.name = 'eth1'
        expect(ass.name).toBe('eth1')
    })
})

describe('Asset — toDict()', () => {
    it('serializza correttamente tutti i campi', () => {
        const ass = new Asset('id-1', 'eth0', AssetType.NETWORK, true, 'LAN')
        expect(ass.toDict()).toEqual({
            id: 'id-1',
            name: 'eth0',
            type: 'Network',
            isSensitive: true,
            desc: 'LAN',
        })
    })

    it('serializza con valori opzionali null', () => {
        const ass = new Asset('id-2', 'wlan0', AssetType.SECURITY, null, null)
        const dict = ass.toDict()
        expect(dict.isSensitive).toBeNull()
        expect(dict.desc).toBeNull()
    })
})
