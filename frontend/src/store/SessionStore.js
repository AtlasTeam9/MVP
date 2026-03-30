import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const INITIAL_SESSION_STATE = {
    sessionId: null,
    pastHistory: [],
    futureHistory: [],
    isTestFinished: false,
    isResumeMode: false,
    isSessionUploaded: false,
    results: null,
    resultsPerAsset: null,
    currentNode: null,
    currentAssetIndex: 0,
    currentTreeIndex: 0,
}

const toNodeRef = (nodeId) => (nodeId ? { id: nodeId } : null)

const mapImportedAnswer = (answerEntry) => ({
    assetIndex: answerEntry.asset_index,
    treeIndex: answerEntry.tree_index,
    nodeId: answerEntry.node_id,
    answer: answerEntry.answer,
})

// Methods to manage session state
const createSessionMethods = (set) => ({
    setSessionId: (sessionId) => set({ sessionId }),
    setCurrentNode: (node) => set({ currentNode: node }),
    setSessionUploaded: (isSessionUploaded) => set({ isSessionUploaded }),
})

// Methods to manage device position in the evaluation flow
const createDeviceMethods = (set) => ({
    setDevicePosition: (assetIndex, treeIndex, nodeId) =>
        set({
            currentAssetIndex: assetIndex,
            currentTreeIndex: treeIndex,
            currentNode: toNodeRef(nodeId),
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

        const filteredHistory = pastHistory.filter(
            (entry) =>
                !(
                    entry.nodeId === currentNode.id &&
                    entry.treeIndex === currentTreeIndex &&
                    entry.assetIndex === currentAssetIndex
                )
        )

        set({
            pastHistory: [...filteredHistory, newEntry],
        })
    },
})

// Methods to manage navigation to the previous node in the session history
const goToPreviousNode = (set, get) => () => {
    const { pastHistory, futureHistory, currentNode, currentTreeIndex, currentAssetIndex } = get()

    if (pastHistory.length === 0) {
        return
    }

    const previousItem = pastHistory[pastHistory.length - 1]
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
                currentNode: toNodeRef(previousItem.nodeId),
        currentTreeIndex: previousItem.treeIndex,
        currentAssetIndex: previousItem.assetIndex,
    })
}

// Methods to manage navigation to the next node in the session history
const goToNextNode = (set, get) => (nodeId) => {
    const { futureHistory, pastHistory, currentNode, currentTreeIndex, currentAssetIndex } = get()

    if (nodeId) {
        set({
            currentNode: toNodeRef(nodeId),
        })
        return
    }

    if (futureHistory.length === 0) {
        return
    }

    const nextItem = futureHistory[0]

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
                currentNode: toNodeRef(nextItem.nodeId),
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
    clearStore: () => set({ ...INITIAL_SESSION_STATE }),

    truncateHistory: (id) => {
        const history = get().pastHistory
        const index = history.findIndex((historyEntry) => historyEntry.nodeId === id)
        if (index !== -1) {
            set({ pastHistory: history.slice(0, index) })
        }
    },

    truncateHistoryByPosition: (assetIndex, treeIndex) => {
        const history = get().pastHistory
        const newHistory = history.filter((item) => {
            // Keep responses from previous assets
            if (item.assetIndex < assetIndex) return true
            // For same asset, keep responses from previous requirements
            if (item.assetIndex === assetIndex && item.treeIndex < treeIndex) return true
            // Don't keep responses from this requirement or later
            return false
        })
        set({ pastHistory: newHistory })
    },

    importPastHistory: (answers) => {
        const formattedHistory = answers.map(mapImportedAnswer)
        set({ pastHistory: formattedHistory })
    },
})

// Methods to manage test completion status and results storage
const createResultMethods = (set) => ({
    setTestFinished: (status) => set({ isTestFinished: status }),
    setResults: (results) => set({ results }),
    setResultsPerAsset: (resultsPerAsset) => set({ resultsPerAsset }),
    setResumeMode: (isResumeMode) => set({ isResumeMode }),
    setPosition: (position) =>
        set({
            currentAssetIndex: position?.assetIndex ?? 0,
            currentTreeIndex: position?.treeIndex ?? 0,
            currentNode: toNodeRef(position?.nodeId),
        }),
})

// Combine all methods into a single store
const useSessionStore = create(
    devtools(
        (set, get) => ({
            ...INITIAL_SESSION_STATE,

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
