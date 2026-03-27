import apiClient from '../infrastructure/api/AxiosApiClient'

class ExportService {
    /**
     * Export results of the session in a specific format (csv, pdf)
     * @param {string} sessionId - ID of the session
     * @param {string} format - Format of the export ('csv' or 'pdf')
     */
    async exportResults(sessionId, format = 'csv') {
        try {
            const blob = await apiClient.get(`/session/${sessionId}/export/results`, {
                params: { format },
                responseType: 'blob',
            })

            console.log('Blob:', blob)
            console.log('Blob type:', typeof blob)
            console.log('Blob size:', blob?.size || blob?.length)

            if (!blob || (blob.size === 0 && blob.length === 0)) {
                throw new Error('Errore: il server ha ritornato una risposta vuota')
            }

            // Converti string a Blob se necessario
            const finalBlob =
                blob instanceof Blob ? blob : new Blob([blob], { type: `application/${format}` })
            this.downloadFile(finalBlob, `results.${format}`)
        } catch (error) {
            console.error(`Error during export of results in ${format}:`, error)
            throw error
        }
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
     */
    async exportSessionAsJSON(sessionId) {
        try {
            const blob = await apiClient.get(`/session/${sessionId}/export`, {
                responseType: 'blob',
            })

            if (!blob || (blob.size === 0 && blob.length === 0)) {
                throw new Error('Errore: il server ha ritornato una risposta vuota')
            }

            const finalBlob =
                blob instanceof Blob ? blob : new Blob([blob], { type: 'application/json' })
            this.downloadFile(finalBlob, 'session.json')
        } catch (error) {
            console.error('Error during export of the session:', error)
            throw error
        }
    }

    /**
     * Export device as JSON
     * @param {Device} device - The device to export
     */
    exportDeviceAsJSON(device) {
        if (!device) {
            throw new Error('Device is required for export')
        }

        try {
            const deviceData = device.toDict()
            const jsonString = JSON.stringify(deviceData, null, 2)
            const blob = new Blob([jsonString], { type: 'application/json' })
            this.downloadFile(blob, `${device.name}.json`)
        } catch (error) {
            console.error('Error during export of the device:', error)
            throw error
        }
    }

    /**
     * Helper method for downloading the file
     * @param {Blob} response - Response blob from the server
     * @param {string} filename - Name of the file to download
     */
    downloadFile(response, filename) {
        const url = window.URL.createObjectURL(new Blob([response]))
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
