import apiClient from '../infrastructure/api/AxiosApiClient'
import StateError from '../infrastructure/errors/StateError'

class ExportService {
    isEmptyPayload(payload) {
        if (payload === null || payload === undefined) {
            return true
        }

        if (payload instanceof Blob) {
            return payload.size === 0
        }

        if (typeof payload === 'string') {
            return payload.length === 0
        }

        if (payload instanceof ArrayBuffer) {
            return payload.byteLength === 0
        }

        if (ArrayBuffer.isView(payload)) {
            return payload.byteLength === 0
        }

        return false
    }

    /**
     * Export results of the session in a specific format (csv, pdf)
     * @param {string} sessionId - ID of the session
     * @param {string} format - Format of the export ('csv' or 'pdf')
     */
    async exportResults(sessionId, format = 'csv') {
        const blob = await apiClient.get(`/session/${sessionId}/export/results`, {
            params: { format },
            responseType: 'blob',
        })

        if (this.isEmptyPayload(blob)) {
            throw new StateError('Il server ha ritornato una risposta vuota.', {
                code: 'EXPORT_EMPTY_RESPONSE',
                context: { format },
            })
        }

        // Converti string a Blob se necessario
        const finalBlob =
            blob instanceof Blob ? blob : new Blob([blob], { type: `application/${format}` })
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
        const blob = await apiClient.post(
            `/session/${sessionId}/export`,
            { answer: answers },
            {
                responseType: 'blob',
            }
        )

        if (this.isEmptyPayload(blob)) {
            throw new StateError('Il server ha ritornato una risposta vuota.', {
                code: 'EXPORT_EMPTY_RESPONSE',
                context: { format: 'json' },
            })
        }

        const finalBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/json' })
        this.downloadFile(finalBlob, 'session.json')
    }

    /**
     * Export device as JSON
     * @param {Device} device - The device to export
     */
    exportDeviceAsJSON(device) {
        if (!device) {
            throw new StateError('Dispositivo mancante per l export.', {
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
        const payload =
            response instanceof Blob
                ? response
                : typeof response === 'string'
                    ? new Blob([response], { type: 'application/json' })
                    : new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })

        const url = window.URL.createObjectURL(payload)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
        window.URL.revokeObjectURL(url)
    }
}

// Exported as a singleton
export default new ExportService()
