import React from 'react'
import { Navigate } from 'react-router-dom'
import { useRouteGuardAccess } from '@application/hooks/useRouteGuardAccess'

// Route guard that redirects to home when required session/device data is missing.
function Guard({ children, routeConfig }) {
    const hasAccess = useRouteGuardAccess(routeConfig)

    if (!hasAccess) {
        return <Navigate to="/" replace />
    }

    return children
}

export default Guard

