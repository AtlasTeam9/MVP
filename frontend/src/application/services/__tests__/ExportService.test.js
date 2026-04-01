import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}))

vi.mock('../AppServices', () => ({
    apiClientService: mocks.apiClient,
}))

import exportService from '@application/services/ExportService'

describe('ExportService payload checks', () => {
    beforeEach(() => {
        mocks.apiClient.get.mockReset()
        mocks.apiClient.post.mockReset()
    })

    it('isEmptyPayload handles supported payload types', () => {
        expect(exportService.isEmptyPayload(null)).toBe(true)
        expect(exportService.isEmptyPayload(undefined)).toBe(true)
        expect(exportService.isEmptyPayload('')).toBe(true)
        expect(exportService.isEmptyPayload('data')).toBe(false)
        expect(exportService.isEmptyPayload(new Blob([]))).toBe(true)
        expect(exportService.isEmptyPayload(new Blob(['x']))).toBe(false)
        expect(exportService.isEmptyPayload(new ArrayBuffer(0))).toBe(true)
        expect(exportService.isEmptyPayload(new ArrayBuffer(2))).toBe(false)
        expect(exportService.isEmptyPayload(new Uint8Array())).toBe(true)
        expect(exportService.isEmptyPayload(new Uint8Array([1]))).toBe(false)
    })

    it('exportResults rejects empty payload from backend', async () => {
        mocks.apiClient.get.mockResolvedValue(new Blob([]))

        await expect(exportService.exportResults('session-1')).rejects.toThrow('risposta vuota')
    })
})

describe('ExportService export operations', () => {
    beforeEach(() => {
        mocks.apiClient.get.mockReset()
        mocks.apiClient.post.mockReset()
    })

    it('exportResults requests backend and downloads resulting file', async () => {
        const payload = new Blob(['csv-content'])
        mocks.apiClient.get.mockResolvedValue(payload)
        const downloadSpy = vi.spyOn(exportService, 'downloadFile').mockImplementation(() => {})

        await exportService.exportResults('session-1', 'csv')

        expect(mocks.apiClient.get).toHaveBeenCalledWith('/session/session-1/export/results', {
            params: { format: 'csv' },
            responseType: 'blob',
        })
        expect(downloadSpy).toHaveBeenCalledWith(payload, 'results.csv')

        downloadSpy.mockRestore()
    })

    it('exportSessionAsJSON posts answers and downloads json file', async () => {
        const payload = new Blob(['session-json'])
        const answers = [{ id: 1 }]
        mocks.apiClient.post.mockResolvedValue(payload)
        const downloadSpy = vi.spyOn(exportService, 'downloadFile').mockImplementation(() => {})

        await exportService.exportSessionAsJSON('session-2', answers)

        expect(mocks.apiClient.post).toHaveBeenCalledWith(
            '/session/session-2/export',
            { answer: answers },
            { responseType: 'blob' }
        )
        expect(downloadSpy).toHaveBeenCalledWith(payload, 'session.json')

        downloadSpy.mockRestore()
    })

    it('exportDeviceAsJSON requires a device object', () => {
        expect(() => exportService.exportDeviceAsJSON(null)).toThrow('Dispositivo mancante')
    })

    it('exportDeviceAsJSON serializes and downloads device data', () => {
        const device = {
            name: 'my-device',
            toDict: () => ({ name: 'my-device', version: '1.0' }),
        }
        const downloadSpy = vi.spyOn(exportService, 'downloadFile').mockImplementation(() => {})

        exportService.exportDeviceAsJSON(device)

        expect(downloadSpy).toHaveBeenCalledTimes(1)
        expect(downloadSpy.mock.calls[0][1]).toBe('my-device.json')

        downloadSpy.mockRestore()
    })
})

describe('ExportService downloadFile', () => {
    it('downloadFile creates and revokes an object URL', () => {
        const createObjectURL = vi.fn(() => 'blob:mock')
        const revokeObjectURL = vi.fn()
        const click = vi.fn()
        const removeChild = vi.fn()
        const appendChild = vi.fn()
        const setAttribute = vi.fn()

        const originalURL = window.URL
        const originalCreateElement = document.createElement
        const originalAppendChild = document.body.appendChild

        window.URL = {
            ...originalURL,
            createObjectURL,
            revokeObjectURL,
        }

        document.createElement = vi.fn(() => ({
            href: '',
            setAttribute,
            click,
            parentNode: { removeChild },
        }))

        document.body.appendChild = appendChild

        exportService.downloadFile('plain-text', 'file.json')

        expect(createObjectURL).toHaveBeenCalledTimes(1)
        expect(appendChild).toHaveBeenCalledTimes(1)
        expect(setAttribute).toHaveBeenCalledWith('download', 'file.json')
        expect(click).toHaveBeenCalledTimes(1)
        expect(removeChild).toHaveBeenCalledTimes(1)
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')

        document.createElement = originalCreateElement
        document.body.appendChild = originalAppendChild
        window.URL = originalURL
    })
})
