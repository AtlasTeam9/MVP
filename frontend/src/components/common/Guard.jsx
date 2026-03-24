import React from 'react'
import { Navigate } from 'react-router-dom'
import useSessionStore from '../../store/SessionStore'
import useDeviceStore from '../../store/DeviceStore'

// Guard component for protect the routes if a user tries to access a protected route without
// the required data
function Guard({ children, routeConfig }) {
    const sessionId = useSessionStore((state) => state.sessionId)
    const currentDevice = useDeviceStore((state) => state.currentDevice)

    if (routeConfig.isProtected) {
        // Routes that require sessionId need both sessionId and currentDevice
        // Routes that don't require sessionId only need currentDevice (pre-session device setup)
        const requiresSessionId = routeConfig.requiresSessionId !== false
        const hasData = requiresSessionId ? !!sessionId && !!currentDevice : !!currentDevice

        if (!hasData) {
            return <Navigate to="/" replace />
        }
    }
    return children
}

export default Guard
