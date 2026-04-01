import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    Device: vi.fn().mockImplementation(function DeviceMock(...args) {
        this.args = args
    }),
    Asset: vi.fn().mockImplementation(function AssetMock(...args) {
        this.args = args
    }),
}))

vi.mock('../../../../domain/Device', () => ({
    default: mocks.Device,
}))

vi.mock('../../../../domain/Asset', () => ({
    default: mocks.Asset,
}))

import {
    createDeviceFromApiResponse,
    mapLoadSessionResponse,
    mapResultsToRequirementResults,
} from '@application/services/sessionHelpers/dataMapper'

describe('createDeviceFromApiResponse', () => {
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
})

describe('mapResultsToRequirementResults', () => {
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

describe('mapLoadSessionResponse', () => {
    it('mapLoadSessionResponse centralizes load-session payload mapping', () => {
        const payload = {
            'session_id': 'S-1',
            device: {
                'device_name': 'D2',
                'operating_system': 'OS2',
                'firmware_version': '2.0.0',
                functionalities: 'f2',
                description: 'device desc',
                assets: [],
            },
            answer: [{ nodeId: 'node1', answer: 'yes' }],
            position: {
                'current_asset_index': 0,
                'current_tree_index': 1,
                'current_node_id': 'node2',
            },
            'aggregate_results': { R1: 'PASS' },
            results: { assetA: { R1: 'PASS' } },
            'is_finished': true,
        }

        const mapped = mapLoadSessionResponse(payload)

        expect(mapped.sessionId).toBe('S-1')
        expect(mapped.answers).toEqual([{ nodeId: 'node1', answer: 'yes' }])
        expect(mapped.position).toEqual(payload.position)
        expect(mapped.resultsPerAsset).toEqual(payload.results)
        expect(mapped.results).toEqual([{ code: 'R1', status: 'PASS' }])
        expect(mapped.isFinished).toBe(true)
        expect(mocks.Device).toHaveBeenCalled()
    })
})



