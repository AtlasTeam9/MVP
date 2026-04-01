import React, { useMemo } from 'react'
import { SessionContent } from '@presentation/components/sessionRunner/SessionContent'
import { useSessionRunnerTrees } from '@application/hooks/useSessionRunnerTrees'
import { buildSessionContextValueFromSources } from '@presentation/components/sessionRunner/sessionContextValueBuilder'

// Adapter component to connect the SessionContent presentation component
// with the session runner state and handlers
function SessionContentAdapter({ currentDevice, state, handlers }) {
    const trees = useSessionRunnerTrees()
    const sessionContextValue = useMemo(
        () => buildSessionContextValueFromSources(currentDevice, state, handlers, trees),
        [currentDevice, state, handlers, trees]
    )

    return <SessionContent sessionContextValue={sessionContextValue} />
}

export { SessionContentAdapter }


