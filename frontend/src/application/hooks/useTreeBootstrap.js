import { useEffect } from 'react'
import TreeService from '@application/services/TreeService'
import { notificationService } from '@application/services/AppServices'

export function useTreeBootstrap() {
    useEffect(() => {
        TreeService.loadTrees().catch((error) =>
            notificationService.notifyError(error, { id: 'LOAD_TREES_ERROR' })
        )
    }, [])
}
