// Clears all local session-related frontend stores.
export function clearLocalSessionState(sessionStore, resultStore) {
    sessionStore.getState().clearStore()
    resultStore.getState().clearStore()
}

// Deletes the remote session if a valid session id is present in the store.
export async function deleteRemoteSessionIfPresent(sessionStore, apiClient) {
    const sessionId = sessionStore.getState().sessionId
    if (!sessionId) {
        return
    }

    await apiClient.delete(`/session/${sessionId}/delete`)
}
