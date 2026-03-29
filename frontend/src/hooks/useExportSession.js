import ExportService from '../services/ExportService'
import SessionService from '../services/SessionService'
import useUIStore from '../store/UIStore'
import NotificationManager from '../infrastructure/notifications/NotificationManager'

export function useExportSession(sessionId) {
    const isExportingSession = useUIStore((state) => state.isExportingSession)
    const setExportingSession = useUIStore((state) => state.setExportingSession)

    const handleExportSessionClick = async () => {
        setExportingSession(true)
        try {
            const answers = SessionService.getFormattedAnswers()
            await ExportService.exportSessionAsJSON(sessionId, answers)
        } catch (error) {
            NotificationManager.notifyError(error)
        } finally {
            setExportingSession(false)
        }
    }

    return {
        isExportingSession,
        handleExportSessionClick,
    }
}
