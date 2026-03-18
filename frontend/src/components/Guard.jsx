import React from 'react'
import { Navigate } from 'react-router-dom'

// Guard component for protect the routes if a user tries to access a protected route without
// the required data
// TODO: Implementare controlli su currentDevice, activeSession
export default function Guard({ children, routeConfig }) {
    if (routeConfig.isProtected) {
        const hasData = false
        if (!hasData) {
            return <Navigate to="/" replace />
        }
    }

    return children
}
