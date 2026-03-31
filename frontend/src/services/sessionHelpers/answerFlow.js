// Stores the selected answer, clears future history, and exits resume mode when needed.
export function applyAnswerTransition(sessionStore, answer) {
    sessionStore.getState().selectAnswer(answer)
    sessionStore.getState().clearFuture()

    if (sessionStore.getState().isResumeMode) {
        sessionStore.getState().setResumeMode(false)
    }
}

// Determines if answer submission must follow the go_back flow.
export function shouldUseGoBackFlow(sessionStore) {
    const { futureHistory, isResumeMode } = sessionStore.getState()
    return futureHistory.length > 0 || isResumeMode
}

// Sends an answer through the go_back endpoint and returns the raw backend response.
export async function postGoBackAnswer(apiClient, sessionId, answer, currentState) {
    return apiClient.post(`/session/${sessionId}/go_back`, {
        'target_asset_index': currentState.currentAssetIndex,
        'target_node_id': currentState.currentNode?.id,
        'target_tree_index': currentState.currentTreeIndex,
        'new_answer': answer,
    })
}

// Sends an answer through the standard forward endpoint and returns the raw backend response.
export async function postForwardAnswer(apiClient, sessionId, answer) {
    return apiClient.post(`/session/${sessionId}/answer`, { answer })
}
