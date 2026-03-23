import { create } from 'zustand'

const createSessionMethods = (set) => ({
    setSessionId: (id) => set({ sessionId: id }),
    setCurrentNode: (node) => set({ currentNode: node }),
})

const createDeviceMethods = (set) => ({
    setDevicePosition: (assetIndex, treeIndex, nodeId) =>
        set({
            currentAssetIndex: assetIndex,
            currentTreeIndex: treeIndex,
            currentNode: { id: nodeId },
        }),
})

const createAnswerMethods = (set, get) => ({
    selectAnswer: (choice) => {
        const { currentNode, pastHistory } = get()
        if (!currentNode) return

        set({
            pastHistory: [...pastHistory, { nodeId: currentNode.id, answer: choice }],
        })
    },
})

const createNavigationMethods = (set) => ({
    goToPreviousNode: () => console.log('Vai al nodo precedente...'),
    goToNextNode: () => console.log('Vai al nodo successivo...'),
    clearFuture: () => set({ futureHistory: [] }),
})

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

const createResultMethods = (set) => ({
    setTestFinished: (status) => set({ isTestFinished: status }),
    setResults: (results) => set({ results: results }),
    setPosition: (pos) => console.log('Impostazione posizione:', pos),
})

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
