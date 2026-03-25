import React from 'react'
import { SessionContent } from './SessionContent'

// Adapter component to connect the SessionContent presentation component
// with the session runner state and handlers
function SessionContentAdapter({ currentDevice, state, handlers }) {
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
        />
    )
}

export { SessionContentAdapter }
