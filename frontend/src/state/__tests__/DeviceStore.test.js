import { beforeEach, describe, expect, it } from 'vitest'
import useDeviceStore from '@state/DeviceStore'
import Device from '@domain/Device'

const assetA = { id: 'asset-a' }
const assetB = { id: 'asset-b' }

const createDevice = (assets = []) =>
    new Device('Device 1', assets, 'OS 1', 'FW 1', ['f1'], 'desc')

describe('DeviceStore', () => {
    beforeEach(() => {
        useDeviceStore.getState().clearStore()
    })

    it('sets and clears the current device', () => {
        const device = createDevice([assetA])
        useDeviceStore.getState().setDevice(device)

        expect(useDeviceStore.getState().currentDevice).toBe(device)

        useDeviceStore.getState().clearStore()
        expect(useDeviceStore.getState().currentDevice).toBe(null)
    })

    it('adds and deletes assets immutably', () => {
        const device = createDevice([assetA])
        useDeviceStore.getState().setDevice(device)

        useDeviceStore.getState().addAsset(assetB)
        const updatedDevice = useDeviceStore.getState().currentDevice

        expect(updatedDevice).not.toBe(device)
        expect(updatedDevice.assets).toEqual([assetA, assetB])

        useDeviceStore.getState().deleteAsset('asset-a')
        const afterDelete = useDeviceStore.getState().currentDevice

        expect(afterDelete.assets).toEqual([assetB])
    })
})
