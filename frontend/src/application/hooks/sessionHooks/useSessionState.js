import useSessionStore from '@state/SessionStore'
import { selectSessionStateSnapshot } from '@state/selectors/sessionSelectors'
import { useShallow } from 'zustand/react/shallow'

// Custom hook to access session state from the store
// It read only from the store, this is why it doesn't use the SessionService
export function useSessionState() {
    return useSessionStore(useShallow(selectSessionStateSnapshot))
}

