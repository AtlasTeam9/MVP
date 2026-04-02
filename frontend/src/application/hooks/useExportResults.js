import { useState } from 'react'
import ExportService from '@application/services/ExportService'
import { useAppServices } from '@application/services/NotificationContext'
import useUIStore from '@state/UIStore'
import { selectIsExporting, selectSetExporting } from '@state/selectors/uiSelectors'

export function useExportResults(sessionId) {
    const { notificationService } = useAppServices()
    const isExporting = useUIStore(selectIsExporting)
    const setExporting = useUIStore(selectSetExporting)
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
            } else {
                throw new Error('Unsupported export format')
            }
        } catch (error) {
            notificationService.notifyError(error)
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
