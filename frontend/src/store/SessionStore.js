import { create } from 'zustand'

// Methods to manage session state
const createSessionMethods = (set) => ({
    setSessionId: (id) => set({ sessionId: id }),
    setCurrentNode: (node) => set({ currentNode: node }),
})

// Methods to manage device position in the evaluation flow
const createDeviceMethods = (set) => ({
    setDevicePosition: (assetIndex, treeIndex, nodeId) =>
        set({
            currentAssetIndex: assetIndex,
            currentTreeIndex: treeIndex,
            currentNode: { id: nodeId },
        }),
})

// Methods to manage user answers and navigation through the session
const createAnswerMethods = (set, get) => ({
    selectAnswer: (choice) => {
        const { currentNode, pastHistory } = get()
        if (!currentNode) return

        set({
            pastHistory: [...pastHistory, { nodeId: currentNode.id, answer: choice }],
        })
    },
})

// Methods to manage navigation to the previous node in the session history
const goToPreviousNode = (set, get) => () => {
    const { pastHistory, futureHistory } = get()

    if (pastHistory.length === 0) {
        console.log('No previous steps to go back to')
        return
    }

    // Move last item from pastHistory to futureHistory
    const lastItem = pastHistory[pastHistory.length - 1]
    set({
        pastHistory: pastHistory.slice(0, -1),
        futureHistory: [lastItem, ...futureHistory],
        currentNode:
            pastHistory.length > 1 ? { id: pastHistory[pastHistory.length - 2].nodeId } : null,
    })
}

// Methods to manage navigation to the next node in the session history
const goToNextNode = (set, get) => (nodeId) => {
    const { futureHistory, pastHistory, currentNode } = get()

    if (currentNode) {
        // Move current node to pastHistory
        set({
            pastHistory: [...pastHistory, { nodeId: currentNode.id, answer: null }],
        })
    }

    // If nodeId is provided, set it as current
    if (nodeId) {
        set({
            currentNode: { id: nodeId },
        })
    } else if (futureHistory.length > 0) {
        // Otherwise, move from futureHistory
        const nextItem = futureHistory[0]
        set({
            currentNode: { id: nextItem.nodeId },
            futureHistory: futureHistory.slice(1),
            pastHistory:
                pastHistory.length > 0
                    ? [...pastHistory, pastHistory[pastHistory.length - 1]]
                    : pastHistory,
        })
    }
}

// Methods to manage navigation and history clearing
const createNavigationMethods = (set, get) => ({
    goToPreviousNode: goToPreviousNode(set, get),
    goToNextNode: goToNextNode(set, get),
    clearFuture: () => set({ futureHistory: [] }),
})

// Methods to manage session history truncation and clearing
const createHistoryMethods = (set, get) => ({
    clearStore: () =>
        set({
            sessionId: null,
            pastHistory: [],
            futureHistory: [],
            isTestFinished: false,
            results: null,
            currentNode: null,
            currentAssetIndex: 0,
            currentTreeIndex: 0,
        }),

    truncateHistory: (id) => {
        const history = get().pastHistory
        const index = history.findIndex((h) => h.nodeId === id)
        if (index !== -1) {
            set({ pastHistory: history.slice(0, index) })
        }
    },
})

// Methods to manage test completion status and results storage
const createResultMethods = (set) => ({
    setTestFinished: (status) => set({ isTestFinished: status }),
    setResults: (results) => set({ results: results }),
    setPosition: (pos) => console.log('Impostazione posizione:', pos),
})

// Combine all methods into a single store
const useSessionStore = create((set, get) => ({
    // Session fields
    sessionId: null,
    pastHistory: [],
    futureHistory: [],
    isTestFinished: false,
    results: null,

    // Position in evaluation flow
    currentNode: null,
    currentAssetIndex: 0,
    currentTreeIndex: 0,

    // Merge all methods
    ...createSessionMethods(set),
    ...createDeviceMethods(set),
    ...createAnswerMethods(set, get),
    ...createNavigationMethods(set),
    ...createHistoryMethods(set, get),
    ...createResultMethods(set),
}))

export default useSessionStore
