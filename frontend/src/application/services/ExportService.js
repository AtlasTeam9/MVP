import { apiClientService } from '@application/services/AppServices'
import StateError from '@application/errors/StateError'
import {
    ensureNonEmptyExportPayload,
    isEmptyPayload,
    toBlob,
} from '@application/services/exportHelpers/payloadUtils'
import { downloadFile as performDownloadFile } from '@application/services/exportHelpers/fileDownloader'

class ExportService {
    isEmptyPayload(payload) {
        return isEmptyPayload(payload)
    }

    /**
     * Export results of the session in a specific format (csv, pdf)
     * @param {string} sessionId - ID of the session
     * @param {string} format - Format of the export ('csv' or 'pdf')
     */
    async exportResults(sessionId, format) {
        const blob = await apiClientService.get(`/session/${sessionId}/export/results`, {
            params: { format },
            responseType: 'blob',
        })

        ensureNonEmptyExportPayload(blob, format)
        const finalBlob = toBlob(blob, `application/${format}`)
        this.downloadFile(finalBlob, `results.${format}`)
    }

    /**
     * Export results as CSV
     * @param {string} sessionId - ID of the session
     */
    async exportResultsAsCSV(sessionId) {
        return this.exportResults(sessionId, 'csv')
    }

    /**
     * Export results as PDF
     * @param {string} sessionId - ID of the session
     */
    async exportResultsAsPDF(sessionId) {
        return this.exportResults(sessionId, 'pdf')
    }

    /**
     * Export complete session as JSON
     * @param {string} sessionId - ID of the session
     * @param {Array} answers - Answer history payload for backend export
     */
    async exportSessionAsJSON(sessionId, answers = []) {
        const blob = await apiClientService.post(
            `/session/${sessionId}/export`,
            { answer: answers },
            {
                responseType: 'blob',
            }
        )

        ensureNonEmptyExportPayload(blob, 'json')
        const finalBlob = toBlob(blob, 'application/json')
        this.downloadFile(finalBlob, 'session.json')
    }

    /**
     * Export device as JSON
     * @param {Device} device - The device to export
     */
    exportDeviceAsJSON(device) {
        if (!device) {
            throw new StateError('Device missing for export.', {
                code: 'EXPORT_DEVICE_REQUIRED',
            })
        }

        const deviceData = device.toDict()
        const jsonString = JSON.stringify(deviceData, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        this.downloadFile(blob, `${device.name}.json`)
    }

    /**
     * Helper method for downloading the file
     * @param {Blob} response - Response blob from the server
     * @param {string} filename - Name of the file to download
     */
    downloadFile(response, filename) {
        performDownloadFile(response, filename)
    }
}

// Exported as a singleton
export default new ExportService()
