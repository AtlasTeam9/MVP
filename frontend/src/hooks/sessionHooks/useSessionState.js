import useSessionStore from '../../store/SessionStore'
import { useShallow } from 'zustand/react/shallow'

// Custom hook to access session state from the store
// It read only from the store, this is why it doesn't use the SessionService
export function useSessionState() {
    return useSessionStore(
        useShallow((state) => ({
            sessionId: state.sessionId,
            currentNode: state.currentNode,
            currentAssetIndex: state.currentAssetIndex,
            currentTreeIndex: state.currentTreeIndex,
            pastHistory: state.pastHistory,
            futureHistory: state.futureHistory,
            isTestFinished: state.isTestFinished,
        }))
    )
}
