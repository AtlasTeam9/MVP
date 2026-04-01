import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Custom hook to redirect to the device summary page if sessionId or currentDevice is missing
export function useSessionRedirect(sessionId, currentDevice) {
    const navigate = useNavigate()
    useEffect(() => {
        if (!sessionId || !currentDevice) navigate('/device/summary')
    }, [sessionId, currentDevice, navigate])
}
