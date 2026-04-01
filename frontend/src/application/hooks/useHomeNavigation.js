import { useNavigate } from 'react-router-dom'
import SessionService from '@application/services/SessionService'
import { notificationService } from '@application/services/AppServices'

export function useHomeNavigation() {
    const navigate = useNavigate()

    const handleLoadDevice = async (file) => {
        try {
            await SessionService.createSessionWithFile(file)
            navigate('/device/summary')
        } catch (err) {
            notificationService.notifyError(err)
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
            notificationService.notifyError(err)
        }
    }

    return {
        handleLoadDevice,
        handleCreateDevice,
        handleLoadPreviousSession,
    }
}

