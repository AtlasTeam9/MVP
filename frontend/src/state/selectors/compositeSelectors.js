export const selectRouteAccess = (sessionId, currentDevice, requiresSessionId = true) => {
    if (!requiresSessionId) {
        return Boolean(currentDevice)
    }

    return Boolean(sessionId) && Boolean(currentDevice)
}

export const selectSessionRunnerTrees = (state) => state.trees
