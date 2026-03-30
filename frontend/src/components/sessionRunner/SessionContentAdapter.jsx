import React, { useMemo } from 'react'
import { SessionContent } from './SessionContent'
import useTreeStore from '../../store/TreeStore'
import { buildSessionContextValueFromSources } from './sessionContextValueBuilder'

// Adapter component to connect the SessionContent presentation component
// with the session runner state and handlers
function SessionContentAdapter({ currentDevice, state, handlers }) {
    const trees = useTreeStore((treeState) => treeState.trees)
    const sessionContextValue = useMemo(
        () => buildSessionContextValueFromSources(currentDevice, state, handlers, trees),
        [currentDevice, state, handlers, trees]
    )

    return <SessionContent sessionContextValue={sessionContextValue} />
}

export { SessionContentAdapter }
