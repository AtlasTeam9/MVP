import React from 'react'
import { Navigate } from 'react-router-dom'

/* Guard component for protect the routes if a user tries to access a protected route without
the required data
 Props:
 * children: React.ReactNode - The content to display if the route is not protected
 * routeConfig: { isProtected: boolean } - Configuration for the route protection
 */
function Guard({ children, routeConfig }) {
    if (routeConfig.isProtected) {
        const hasData = false
        if (!hasData) {
            return <Navigate to="/" replace />
        }
    }
    // TODO: Implementare controlli su currentDevice, activeSession
    // (al momento se una route è protetta, non mostra il contenuto e reindirizza alla home)
    return children
}

export default Guard
