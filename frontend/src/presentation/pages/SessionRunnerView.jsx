import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentDevice } from '@application/hooks/useCurrentDevice'
import { useSessionState } from '@application/hooks/sessionHooks/useSessionState'
import { useSessionRedirect } from '@application/hooks/sessionHooks/useSessionRedirect'
import { useSessionHandlers } from '@application/hooks/sessionHooks/useSessionHandlers'
import { SessionContentAdapter } from '@presentation/components/sessionRunner/SessionContentAdapter'

// Main view component for the session runner, which manages the session state
// and renders the appropriate content based on the current state of the session
export default function SessionRunnerView() {
    const navigate = useNavigate()
    const device = useCurrentDevice()
    const state = useSessionState()
    useSessionRedirect(state.sessionId, device)
    const handlers = useSessionHandlers()

    // When test is finished, navigate to results page
    useEffect(() => {
        if (state.isTestFinished) {
            navigate('/results')
        }
    }, [state.isTestFinished, navigate])

    return <SessionContentAdapter currentDevice={device} state={state} handlers={handlers} />
}


