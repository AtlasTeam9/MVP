import { useState } from 'react'
import ExportService from '../services/ExportService'
import useUIStore from '../store/UIStore'
import NotificationManager from '../infrastructure/notifications/NotificationManager'

export function useExportResults(sessionId) {
    const isExporting = useUIStore((state) => state.isExporting)
    const setExporting = useUIStore((state) => state.setExporting)
    const [showFormatDialog, setShowFormatDialog] = useState(false)

    const handleExportClick = () => {
        setShowFormatDialog(true)
    }

    const handleExportFormat = async (format) => {
        setShowFormatDialog(false)
        setExporting(true)
        try {
            if (format === 'csv') {
                await ExportService.exportResultsAsCSV(sessionId)
            } else if (format === 'pdf') {
                await ExportService.exportResultsAsPDF(sessionId)
            }
        } catch (error) {
            NotificationManager.notifyError(error)
        } finally {
            setExporting(false)
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
