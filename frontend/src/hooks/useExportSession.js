import { useState } from 'react'
import ExportService from '../services/ExportService'

export function useExportSession(sessionId) {
    const [isExportingSession, setIsExportingSession] = useState(false)

    const handleExportSessionClick = async () => {
        setIsExportingSession(true)
        try {
            await ExportService.exportSessionAsJSON(sessionId)
        } catch (error) {
            alert("Errore durante l'export della sessione: " + error.message)
        } finally {
            setIsExportingSession(false)
        }
    }

    return {
        isExportingSession,
        handleExportSessionClick,
    }
}
