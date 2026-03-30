import { useNavigate } from 'react-router-dom'
import SessionService from '../services/SessionService'
import NotificationManager from '../infrastructure/notifications/NotificationManager'

export function useHomeNavigation() {
    const navigate = useNavigate()

    const handleLoadDevice = async (file) => {
        try {
            await SessionService.createSessionWithFile(file)
            navigate('/device/summary')
        } catch (err) {
            NotificationManager.notifyError(err)
        }
    }

    const handleCreateDevice = () => {
        navigate('/device/new')
    }

    const handleLoadPreviousSession = async (file) => {
        try {
            await SessionService.loadSessionFromFile(file)
            navigate('/results')
        } catch (err) {
            NotificationManager.notifyError(err)
        }
    }

    return {
        handleLoadDevice,
        handleCreateDevice,
        handleLoadPreviousSession,
    }
}
