import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { DecisionTree } from '@domain/DecisionTree'

// Helper function to search for a node by tree index and node ID
function findNodeInTree(trees, treeIndex, nodeId) {
    if (treeIndex < 0 || treeIndex >= trees.length) {
        return null
    }

    const tree = trees[treeIndex]
    if (!tree) {
        return null
    }

    if (typeof tree.getNodeById === 'function') {
        return tree.getNodeById(nodeId)
    }

    // Backward-compatible fallback for legacy plain-object trees.
    if (!tree.nodes || !tree.nodes[nodeId]) {
        return null
    }

    const nodeData = tree.nodes[nodeId]
    return {
        id: nodeId,
        text: nodeData.text || nodeData.question || '',
        description: nodeData.description || null,
        type: nodeData.type,
    }
}

function normalizeTree(tree) {
    if (tree instanceof DecisionTree) {
        return tree
    }

    return DecisionTree.fromApi(tree)
}

const useTreeStore = create(
    devtools(
        (set, get) => ({
            // State
            trees: [],
            error: null,

            // Actions
            setTrees: (trees) => {
                const normalizedTrees = Array.isArray(trees) ? trees.map(normalizeTree) : []
                set({ trees: normalizedTrees })
            },
            setError: (error) => set({ error }),

            // Selectors
            getNodeByTreeIndexAndNodeId: (treeIndex, nodeId) =>
                findNodeInTree(get().trees, treeIndex, nodeId),

            // Clear store
            clearStore: () => set({ trees: [], error: null }),
        }),
        { name: 'TreeStore' }
    )
)

export default useTreeStore
