import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

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
        const { currentNode, pastHistory, currentTreeIndex, currentAssetIndex } = get()
        if (!currentNode) return

        const newEntry = {
            nodeId: currentNode.id,
            answer: choice,
            treeIndex: currentTreeIndex,
            assetIndex: currentAssetIndex,
        }

        set({
            pastHistory: [...pastHistory, newEntry],
        })
    },
})

// Methods to manage navigation to the previous node in the session history
const goToPreviousNode = (set, get) => () => {
    const { pastHistory, futureHistory, currentNode, currentTreeIndex, currentAssetIndex } = get()

    if (pastHistory.length === 0) {
        return
    }

    // Get the previous item from pastHistory
    const previousItem = pastHistory[pastHistory.length - 1]

    // Save the current node to futureHistory so we can go back to it
    const newFutureHistory = currentNode
        ? [
              {
                  nodeId: currentNode.id,
                  answer: previousItem?.answer ?? null,
                  treeIndex: currentTreeIndex,
                  assetIndex: currentAssetIndex,
              },
              ...futureHistory,
          ]
        : futureHistory

    set({
        pastHistory: pastHistory.slice(0, -1),
        futureHistory: newFutureHistory,
        currentNode: { id: previousItem.nodeId },
        currentTreeIndex: previousItem.treeIndex,
        currentAssetIndex: previousItem.assetIndex,
    })
}

// Methods to manage navigation to the next node in the session history
const goToNextNode = (set, get) => (nodeId) => {
    const { futureHistory, pastHistory, currentNode, currentTreeIndex, currentAssetIndex } = get()

    // If nodeId is provided, set it as current
    if (nodeId) {
        set({
            currentNode: { id: nodeId },
        })
        return
    }

    // Otherwise, move from futureHistory
    if (futureHistory.length === 0) {
        return
    }

    const nextItem = futureHistory[0]

    // Always add current node to pastHistory when going forward
    const newPastHistory = currentNode
        ? [
              ...pastHistory,
              {
                  nodeId: currentNode.id,
                  answer: pastHistory[pastHistory.length - 1]?.answer ?? null,
                  treeIndex: currentTreeIndex,
                  assetIndex: currentAssetIndex,
              },
          ]
        : pastHistory

    set({
        pastHistory: newPastHistory,
        currentNode: { id: nextItem.nodeId },
        futureHistory: futureHistory.slice(1),
        currentTreeIndex: nextItem.treeIndex ?? 0,
        currentAssetIndex: nextItem.assetIndex ?? 0,
    })
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
const useSessionStore = create(
    devtools(
        (set, get) => ({
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
            ...createNavigationMethods(set, get),
            ...createHistoryMethods(set, get),
            ...createResultMethods(set),
        }),
        { name: 'SessionStore' }
    )
)

export default useSessionStore
