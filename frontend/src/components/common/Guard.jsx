import React from 'react'
import { Navigate } from 'react-router-dom'
import useDeviceStore from '../../store/DeviceStore'

/* Guard component for protect the routes if a user tries to access a protected route without
the required data
 Props:
 * children: React.ReactNode - The content to display if the route is not protected
 * routeConfig: { isProtected: boolean } - Configuration for the route protection
 */
function Guard({ children, routeConfig }) {
    const currentDevice = useDeviceStore((state) => state.currentDevice)

    if (routeConfig.isProtected) {
        const hasData = !!currentDevice

        if (!hasData) {
            return <Navigate to="/" replace />
        }
    }
    // TODO: Implementare controlli oltre che su currentDevice anche su activeSession
    // (al momento se una route è protetta, non mostra il contenuto e reindirizza alla home)
    return children
}

export default Guard
