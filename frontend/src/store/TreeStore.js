import { create } from 'zustand'

// Helper function to search for a node by tree index and node ID
function findNodeInTree(trees, treeIndex, nodeId) {
    if (treeIndex < 0 || treeIndex >= trees.length) {
        console.warn(`Invalid tree index: ${treeIndex}`)
        return null
    }

    const tree = trees[treeIndex]
    if (!tree || !tree.nodes || !tree.nodes[nodeId]) {
        console.warn(`Node not found: tree="${tree?.id}", nodeId="${nodeId}"`)
        return null
    }

    const nodeData = tree.nodes[nodeId]
    const result = {
        id: nodeId,
        text: nodeData.question || '',
        description: nodeData.description || null,
    }
    return result
}

const useTreeStore = create((set, get) => ({
    // State
    trees: [],
    isLoading: false,
    error: null,

    // Actions
    setTrees: (trees) => {
        set({ trees })
    },
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Selectors
    getNodeByTreeIndexAndNodeId: (treeIndex, nodeId) =>
        findNodeInTree(get().trees, treeIndex, nodeId),

    // Clear store
    clearStore: () => set({ trees: [], isLoading: false, error: null }),
}))

export default useTreeStore
