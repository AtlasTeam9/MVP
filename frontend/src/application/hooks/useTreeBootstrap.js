import { useEffect } from 'react'
import TreeService from '@application/services/TreeService'
import { useAppServices } from '@application/services/NotificationContext'

export function useTreeBootstrap() {
    const { notificationService } = useAppServices()

    useEffect(() => {
        TreeService
            .loadTrees()
            .catch((error) => notificationService.notifyError(error, { id: 'LOAD_TREES_ERROR' }))
    }, [notificationService])
}
