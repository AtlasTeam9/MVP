/**
 * Calculates the test completion percentage based on nodes answered
 * @param {Array} trees - Array of decision trees from TreeStore
 * @param {Array} pastHistory - Array of answered nodes from SessionStore
 * @returns {number} Completion percentage (0-100)
 */
export function calculateCompletionPercentage(trees, pastHistory) {
    if (!trees || trees.length === 0) {
        return 0
    }

    // Count total nodes across all trees
    let totalNodes = 0
    trees.forEach((tree) => {
        if (tree.nodes) {
            totalNodes += Object.keys(tree.nodes).length
        }
    })

    if (totalNodes === 0) {
        return 0
    }

    // Count answered nodes (unique nodes in pastHistory)
    const answeredNodesSet = new Set(pastHistory.map((item) => item.nodeId))
    const answeredNodesCount = answeredNodesSet.size

    // Calculate percentage
    const percentage = Math.round((answeredNodesCount / totalNodes) * 100)

    console.log('Progress Calculation:', {
        totalNodes,
        answeredNodesCount,
        pastHistory,
        trees,
        percentage,
    })

    return percentage
}

/**
 * Calculates completion percentage for a single asset
 * @param {Array} assetTrees - Trees for a specific asset
 * @param {Array} pastHistory - Answer history
 * @returns {number} Asset completion percentage (0-100)
 */
export function calculateAssetCompletionPercentage(assetTrees, pastHistory) {
    if (!assetTrees || assetTrees.length === 0) {
        return 0
    }

    let totalNodes = 0
    assetTrees.forEach((tree) => {
        if (tree.nodes) {
            totalNodes += Object.keys(tree.nodes).length
        }
    })

    if (totalNodes === 0) {
        return 0
    }

    const answeredNodesSet = new Set(pastHistory.map((item) => item.nodeId))
    const answeredNodesCount = answeredNodesSet.size

    return Math.round((answeredNodesCount / totalNodes) * 100)
}
