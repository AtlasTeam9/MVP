import { useEffect } from 'react'
import sessionService from '@application/services/SessionService'

export function useBeforeUnload() {
    useEffect(() => {
        const handler = () => {
            const sessionId = sessionService.getSessionId()

            if (sessionId) {
                fetch(`${import.meta.env.VITE_API_BASE_URL}/session/${sessionId}`, {
                    method: 'DELETE',
                    keepalive: true, // Allows the request to complete even if the page is unloading
                })
            }
            sessionService.clearSession()
        }

        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [])
}

