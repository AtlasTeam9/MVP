import { useMemo } from 'react'
import useSessionStore from '@state/SessionStore'
import useDeviceStore from '@state/DeviceStore'
import { selectSessionId } from '@state/selectors/sessionSelectors'
import { selectCurrentDevice } from '@state/selectors/deviceSelectors'
import { selectRouteAccess } from '@state/selectors/compositeSelectors'

export function useRouteGuardAccess(routeConfig) {
    const sessionId = useSessionStore(selectSessionId)
    const currentDevice = useDeviceStore(selectCurrentDevice)

    return useMemo(() => {
        if (!routeConfig?.isProtected) {
            return true
        }

        const requiresSessionId = routeConfig.requiresSessionId !== false
        return selectRouteAccess(sessionId, currentDevice, requiresSessionId)
    }, [routeConfig, sessionId, currentDevice])
}
