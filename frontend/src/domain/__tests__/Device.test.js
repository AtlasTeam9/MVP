import { describe, it, expect } from 'vitest'
import Device from '../Device'
import Asset, { AssetType } from '../Asset'

describe('Device — costruttore e valori di default', () => {
    it('crea un Device con solo il nome', () => {
        const dev = new Device('Router')
        expect(dev.name).toBe('Router')
        expect(dev.getAssets()).toEqual([])
        expect(dev.operativeSystem).toBeNull()
        expect(dev.firmwareVersion).toBeNull()
        expect(dev.functionalities).toBeNull()
    })

    it('restituisce la descrizione di default se non fornita', () => {
        const dev = new Device('Switch')
        expect(dev.description).toBe('Description not inserted')
    })

    it('restituisce la descrizione fornita se presente', () => {
        const dev = new Device('Switch', [], null, null, null, 'My description')
        expect(dev.description).toBe('My description')
    })

    it('inizializza correttamente tutti i campi', () => {
        const dev = new Device('Firewall', [], 'Linux', '2.1.0', 'filtering', 'A firewall device')
        expect(dev.operativeSystem).toBe('Linux')
        expect(dev.firmwareVersion).toBe('2.1.0')
        expect(dev.functionalities).toBe('filtering')
        expect(dev.description).toBe('A firewall device')
    })
})

describe('Device — toDict() campi base', () => {
    it('serializza correttamente un device senza asset', () => {
        const dev = new Device('Router', [], 'Linux', '1.0', 'routing', 'Desc')
        const dict = dev.toDict()
        expect(dict).toEqual({
            deviceName: 'Router',
            assets: [],
            operativeSystem: 'Linux',
            firmwareVersion: '1.0',
            functionalities: 'routing',
            description: 'Desc',
        })
    })

    it('usa la descrizione di default in toDict() se non fornita', () => {
        const dev = new Device('Router')
        expect(dev.toDict().description).toBe('Description not inserted')
    })
})

describe('Device — toDict() con asset', () => {
    it('serializza correttamente gli asset inclusi', () => {
        const asset = new Asset('a1', 'eth0', AssetType.NETWORK, false, 'LAN interface')
        const dev = new Device('Router', [asset], 'Linux', '1.0', 'routing')
        const dict = dev.toDict()
        expect(dict.assets).toHaveLength(1)
        expect(dict.assets[0]).toEqual({
            id: 'a1',
            name: 'eth0',
            type: 'Network',
            isSensitive: false,
            desc: 'LAN interface',
        })
    })
})

describe('Device — getAssets()', () => {
    it('restituisce array vuoto se nessun asset', () => {
        const dev = new Device('Device')
        expect(dev.getAssets()).toEqual([])
    })

    it('restituisce gli asset passati al costruttore', () => {
        const a1 = new Asset('1', 'eth0', AssetType.NETWORK)
        const a2 = new Asset('2', 'wlan0', AssetType.SECURITY)
        const dev = new Device('Device', [a1, a2])
        expect(dev.getAssets()).toHaveLength(2)
    })
})
