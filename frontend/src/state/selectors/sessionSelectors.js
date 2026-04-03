export const selectSessionId = (state) => state.sessionId
export const selectResultsPerAsset = (state) => state.resultsPerAsset
export const selectResultViewSessionState = (state) => ({
    sessionId: state.sessionId,
    isTestFinished: state.isTestFinished,
    isSessionUploaded: state.isSessionUploaded,
    resultsPerAsset: state.resultsPerAsset,
})

export const selectSessionStateSnapshot = (state) => ({
    sessionId: state.sessionId,
    currentNode: state.currentNode,
    currentAssetIndex: state.currentAssetIndex,
    currentTreeIndex: state.currentTreeIndex,
    pastHistory: state.pastHistory,
    futureHistory: state.futureHistory,
    isTestFinished: state.isTestFinished,
})
