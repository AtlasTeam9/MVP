import useSessionStore from '../../store/SessionStore'

// Custom hook to access session state from the store
// It read only from the store, this is why it doesn't use the SessionService
export function useSessionState() {
    const sessionId = useSessionStore((state) => state.sessionId)
    const currentNode = useSessionStore((state) => state.currentNode)
    const currentAssetIndex = useSessionStore((state) => state.currentAssetIndex)
    const currentTreeIndex = useSessionStore((state) => state.currentTreeIndex)
    const pastHistory = useSessionStore((state) => state.pastHistory)
    const futureHistory = useSessionStore((state) => state.futureHistory)
    const isTestFinished = useSessionStore((state) => state.isTestFinished)

    return {
        sessionId,
        currentNode,
        currentAssetIndex,
        currentTreeIndex,
        pastHistory,
        futureHistory,
        isTestFinished,
    }
}
