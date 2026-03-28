import { useState } from 'react'
import ExportService from '../services/ExportService'
import SessionService from '../services/SessionService'

export function useExportSession(sessionId) {
    const [isExportingSession, setIsExportingSession] = useState(false)

    const handleExportSessionClick = async () => {
        setIsExportingSession(true)
        try {
            const answers = SessionService.getFormattedAnswers()
            await ExportService.exportSessionAsJSON(sessionId, answers)
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
