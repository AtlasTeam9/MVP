import { useState } from 'react'
import ExportService from '../services/ExportService'

export function useExportResults(sessionId) {
    const [isExporting, setIsExporting] = useState(false)
    const [showFormatDialog, setShowFormatDialog] = useState(false)

    const handleExportClick = () => {
        setShowFormatDialog(true)
    }

    const handleExportFormat = async (format) => {
        setShowFormatDialog(false)
        setIsExporting(true)
        try {
            if (format === 'csv') {
                await ExportService.exportResultsAsCSV(sessionId)
            } else if (format === 'pdf') {
                await ExportService.exportResultsAsPDF(sessionId)
            }
        } catch (error) {
            alert("Errore durante l'export: " + error.message)
        } finally {
            setIsExporting(false)
        }
    }

    return {
        isExporting,
        showFormatDialog,
        handleExportClick,
        handleExportFormat,
        setShowFormatDialog,
    }
}
