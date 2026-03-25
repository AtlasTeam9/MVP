import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentDevice } from '../services/DeviceService'
import { useSessionState } from '../hooks/sessionHooks/useSessionState'
import { useSessionRedirect } from '../hooks/sessionHooks/useSessionRedirect'
import { useSessionHandlers } from '../hooks/sessionHooks/useSessionHandlers'
import { CompletionScreen } from '../components/sessionRunner/CompletionScreen'
import { SessionContentAdapter } from '../components/sessionRunner/SessionContentAdapter'

// Main view component for the session runner, which manages the session state
// and renders the appropriate content based on the current state of the session
export default function SessionRunnerView() {
    const navigate = useNavigate()
    const device = useCurrentDevice()
    const state = useSessionState()
    useSessionRedirect(state.sessionId, device)
    const handlers = useSessionHandlers()

    // When test is finished, navigate to results page
    React.useEffect(() => {
        if (state.isTestFinished) {
            navigate('/results')
        }
    }, [state.isTestFinished, navigate])

    return <SessionContentAdapter currentDevice={device} state={state} handlers={handlers} />
}
