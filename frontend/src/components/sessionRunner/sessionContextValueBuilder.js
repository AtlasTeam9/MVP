function buildSessionContextValue({
    currentDevice,
    currentNode,
    currentAssetIndex,
    currentTreeIndex,
    isLoading,
    error,
    onYes,
    onNo,
    onBack,
    onForward,
    onHome,
    onSaveExit,
    pastHistory,
    futureHistory,
    trees,
}) {
    return {
        currentDevice,
        currentNode,
        currentAssetIndex,
        currentTreeIndex,
        isLoading,
        error,
        onYes,
        onNo,
        onBack,
        onForward,
        onHome,
        onSaveExit,
        pastHistory,
        futureHistory,
        trees,
    }
}

function buildSessionContextValueFromSources(currentDevice, state, handlers, trees) {
    return buildSessionContextValue({
        currentDevice,
        currentNode: state.currentNode,
        currentAssetIndex: state.currentAssetIndex,
        currentTreeIndex: state.currentTreeIndex,
        isLoading: handlers.isLoading,
        error: handlers.error,
        onYes: handlers.handleYesClick,
        onNo: handlers.handleNoClick,
        onBack: handlers.handleBackClick,
        onForward: handlers.handleForwardClick,
        onHome: handlers.handleHomeClick,
        onSaveExit: handlers.handleSaveAndExitClick,
        pastHistory: state.pastHistory,
        futureHistory: state.futureHistory,
        trees,
    })
}

export { buildSessionContextValue, buildSessionContextValueFromSources }
