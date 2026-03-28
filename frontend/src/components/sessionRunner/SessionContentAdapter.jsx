import React, { useEffect } from 'react'
import { SessionContent } from './SessionContent'
import useTreeStore from '../../store/TreeStore'
import { initializeProgressCalculator } from '../../infrastructure/utils/progressCalculator'

// Adapter component to connect the SessionContent presentation component
// with the session runner state and handlers
function SessionContentAdapter({ currentDevice, state, handlers }) {
    const trees = useTreeStore((treeState) => treeState.trees)

    // Initialize progress calculator when trees or device changes
    // This is done in the adapter (container) to avoid prop drilling
    useEffect(() => {
        if (trees && currentDevice) {
            initializeProgressCalculator(trees, currentDevice.assets)
        }
    }, [trees, currentDevice, state.sessionId])

    return (
        <SessionContent
            currentDevice={currentDevice}
            currentNode={state.currentNode}
            currentAssetIndex={state.currentAssetIndex}
            isLoading={handlers.isLoading}
            error={handlers.error}
            onYes={handlers.handleYesClick}
            onNo={handlers.handleNoClick}
            onBack={handlers.handleBackClick}
            onForward={handlers.handleForwardClick}
            onHome={handlers.handleHomeClick}
            onSaveExit={handlers.handleSaveAndExitClick}
            pastHistory={state.pastHistory}
            futureHistory={state.futureHistory}
            trees={trees}
        />
    )
}

export { SessionContentAdapter }
