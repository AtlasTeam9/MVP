import React from 'react'
import { Navigate } from 'react-router-dom'
import useSessionStore from '../../store/SessionStore'
import useDeviceStore from '../../store/DeviceStore'

/* Guard component for protect the routes if a user tries to access a protected route without
the required data
 Props:
 * children: React.ReactNode - The content to display if the route is not protected
 * routeConfig: { isProtected: boolean } - Configuration for the route protection
 */
function Guard({ children, routeConfig }) {
    const sessionId = useSessionStore((state) => state.sessionId)
    const currentDevice = useDeviceStore((state) => state.currentDevice)

    if (routeConfig.isProtected) {
        const hasData = !!sessionId && !!currentDevice

        if (!hasData) {
            return <Navigate to="/" replace />
        }
    }
    return children
}

export default Guard
