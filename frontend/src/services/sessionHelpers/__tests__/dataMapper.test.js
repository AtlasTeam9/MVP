import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    Device: vi.fn().mockImplementation(function DeviceMock(...args) {
        this.args = args
    }),
    Asset: vi.fn().mockImplementation(function AssetMock(...args) {
        this.args = args
    }),
}))

vi.mock('../../../domain/Device', () => ({
    default: mocks.Device,
}))

vi.mock('../../../domain/Asset', () => ({
    default: mocks.Asset,
}))

import { createDeviceFromApiResponse, mapResultsToRequirementResults } from '../dataMapper'

describe('dataMapper helpers', () => {
    it('createDeviceFromApiResponse maps snake_case payload to domain constructors', () => {
        const payload = {
            'device_name': 'D1',
            'operating_system': 'OS',
            'firmware_version': '1.2.3',
            functionalities: 'f1',
            description: 'desc',
            assets: [
                {
                    id: 'a1',
                    name: 'Asset 1',
                    type: 'type-1',
                    'is_sensitive': true,
                    description: 'sensitive asset',
                },
            ],
        }

        createDeviceFromApiResponse(payload)

        expect(mocks.Asset).toHaveBeenCalledWith('a1', 'Asset 1', 'type-1', true, 'sensitive asset')
        expect(mocks.Device).toHaveBeenCalledTimes(1)
        expect(mocks.Device.mock.calls[0][0]).toBe('D1')
        expect(mocks.Device.mock.calls[0][2]).toBe('OS')
        expect(mocks.Device.mock.calls[0][3]).toBe('1.2.3')
        expect(mocks.Device.mock.calls[0][4]).toBe('f1')
        expect(mocks.Device.mock.calls[0][5]).toBe('desc')
    })

    it('mapResultsToRequirementResults transforms object map to array format', () => {
        const mapped = mapResultsToRequirementResults({ R1: 'ok', R2: 'ko' })

        expect(mapped).toEqual([
            { code: 'R1', status: 'ok' },
            { code: 'R2', status: 'ko' },
        ])
    })

    it('mapResultsToRequirementResults handles missing payload', () => {
        expect(mapResultsToRequirementResults()).toEqual([])
    })
})
