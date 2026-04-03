import ExportService from '@application/services/ExportService'
import SessionService from '@application/services/SessionService'
import { useAppServices } from '@application/services/NotificationContext'
import useUIStore from '@state/UIStore'
import { selectIsExportingSession, selectSetExportingSession } from '@state/selectors/uiSelectors'

export function useExportSession(sessionId) {
    const { notificationService } = useAppServices()
    const isExportingSession = useUIStore(selectIsExportingSession)
    const setExportingSession = useUIStore(selectSetExportingSession)

    const handleExportSessionClick = async () => {
        setExportingSession(true)
        try {
            const answers = SessionService.getFormattedAnswers()
            await ExportService.exportSessionAsJSON(sessionId, answers)
        } catch (error) {
            notificationService.notifyError(error)
        } finally {
            setExportingSession(false)
        }
    }

    return {
        isExportingSession,
        handleExportSessionClick,
    }
}
