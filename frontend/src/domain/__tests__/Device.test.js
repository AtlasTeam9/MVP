import { describe, it, expect } from 'vitest'
import Device from '../Device'
import Asset, { AssetType } from '../Asset'

// Unit test for contructor
describe('Device — constructor and default values', () => {
    it('initialize all fields correctly', () => {
        const dev = new Device('Firewall', [], 'Linux', '2.1.0', 'filtering', 'A firewall device')
        expect(dev.name).toBe('Firewall')
        expect(dev.assets).toEqual([])
        expect(dev.operatingSystem).toBe('Linux')
        expect(dev.firmwareVersion).toBe('2.1.0')
        expect(dev.functionalities).toBe('filtering')
        expect(dev.description).toBe('A firewall device')
    })

    it('create a Device with only the obligatory parameters', () => {
        const dev = new Device('Router', [], 'Linux', '1.0', 'routing')
        expect(dev.name).toBe('Router')
        expect(dev.assets).toEqual([])
        expect(dev.operatingSystem).toBe('Linux')
        expect(dev.firmwareVersion).toBe('1.0')
        expect(dev.functionalities).toBe('routing')
        expect(dev.description).toBe('Description not inserted')
    })

    it('use the default description if not provided', () => {
        const dev = new Device('Switch', [], 'Linux', '1.0', 'switching')
        expect(dev.description).toBe('Description not inserted')
    })

    it('use the provided description if available', () => {
        const dev = new Device('Switch', [], 'Linux', '1.0', 'switching', 'My description')
        expect(dev.description).toBe('My description')
    })
})

// Unit test for toDict() method
describe('Device — toDict() without assets or description', () => {
    it('serialize correctly a device without assets', () => {
        const dev = new Device('Router', [], 'Linux', '1.0', 'routing', 'Desc')
        const dict = dev.toDict()
        expect(dict).toEqual({
            'device_name': 'Router',
            assets: [],
            'operating_system': 'Linux',
            'firmware_version': '1.0',
            functionalities: 'routing',
            description: 'Desc',
        })
    })

    it('use the default description in toDict() if not provided', () => {
        const dev = new Device('Router', [], 'Linux', '1.0', 'routing')
        expect(dev.toDict().description).toBe('Description not inserted')
    })
})

// Unit test for toDict() with assets
describe('Device — toDict() with assets', () => {
    it('serialize correctly the included assets', () => {
        const asset = new Asset('a1', 'eth0', AssetType.NETWORK_FUNCTION, false, 'LAN interface')
        const dev = new Device('Router', [asset], 'Linux', '1.0', 'routing')
        const dict = dev.toDict()
        expect(dict.assets).toHaveLength(1)
        expect(dict.assets[0]).toEqual({
            id: 'a1',
            name: 'eth0',
            type: AssetType.NETWORK_FUNCTION,
            'is_sensitive': false,
            description: 'LAN interface',
        })
    })
})

// Unit test for length of assets returned by get assets() method
describe('Device — get assets()', () => {
    it('returns an empty array if no assets are provided', () => {
        const dev = new Device('Device', [], 'Linux', '1.0', 'functionality')
        expect(dev.assets).toHaveLength(0)
    })

    it('returns the assets passed to the constructor', () => {
        const a1 = new Asset('1', 'eth0', AssetType.NETWORK_FUNCTION, false, 'LAN interface')
        const a2 = new Asset('2', 'wlan0', AssetType.SECURITY_FUNCTION, true, 'Wireless interface')
        const dev = new Device('Device', [a1, a2], 'Linux', '1.0', 'functionality')
        expect(dev.assets).toHaveLength(2)
    })

    it('adds and removes assets by id', () => {
        const asset1 = new Asset('1', 'eth0', AssetType.NETWORK_FUNCTION, false, 'LAN interface')
        const asset2 = new Asset('2', 'wlan0', AssetType.SECURITY_FUNCTION, true, 'WiFi interface')
        const dev = new Device('Device', [asset1], 'Linux', '1.0', 'functionality')

        dev.addAsset(asset2)
        expect(dev.assets).toHaveLength(2)

        dev.deleteAsset('1')
        expect(dev.assets).toHaveLength(1)
        expect(dev.assets[0].name).toBe('wlan0')
    })
})
