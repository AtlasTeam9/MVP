/**
 * Calculates the test completion percentage based on tree-level progression.
 * Each asset must evaluate all trees sequentially.
 * Previous trees are considered fully completed; current tree contributes partial progress.
 * @param {number} currentAssetIndex - Current asset index (0 to totalAssets-1)
 * @param {Array} pastHistory - Array of answered nodes (used to count visited nodes)
 * @param {Array} trees - Array of decision trees from TreeStore
 * @param {Array} assets - Array of assets from current device
 * @param {number} currentTreeIndex - Current tree index within the current asset
 * @returns {number} Completion percentage (0-100)
 */
export function calculateCompletionPercentage(
    currentAssetIndex = 0,
    pastHistory = [],
    trees = [],
    assets = [],
    currentTreeIndex = 0
) {
    const totalAssets = assets ? assets.length : 0
    const totalTrees = trees ? trees.length : 0

    if (totalTrees === 0 || totalAssets === 0) {
        return 0
    }

    const safeAssetIndex = Math.max(0, Math.min(currentAssetIndex, totalAssets - 1))
    const safeTreeIndex = Math.max(0, Math.min(currentTreeIndex, totalTrees - 1))
    const currentTree = trees[safeTreeIndex]
    const currentTreeNodeCount = currentTree?.nodes ? Object.keys(currentTree.nodes).length : 0

    // Count answered nodes in current tree only, without double-counting revisited nodes.
    const currentTreeEntries = pastHistory.filter(
        (entry) => entry.assetIndex === safeAssetIndex && entry.treeIndex === safeTreeIndex
    )
    const uniqueAnsweredNodesInTree = new Set(
        currentTreeEntries
            .filter((entry) => entry.nodeId)
            .map((entry) => entry.nodeId)
    )
    const entriesWithoutNodeId = currentTreeEntries.filter((entry) => !entry.nodeId).length
    const answeredNodesInCurrentTree = uniqueAnsweredNodesInTree.size + entriesWithoutNodeId

    const currentTreeProgress =
        currentTreeNodeCount > 0
            ? Math.min(answeredNodesInCurrentTree / currentTreeNodeCount, 1)
            : 0

    // Total evaluation units = each asset evaluates all trees.
    const totalEvaluationTrees = totalAssets * totalTrees

    // Completed units:
    // - all trees in previous assets
    // - all previous trees in current asset
    // - partial progress in current tree
    const completedEquivalentTrees =
        safeAssetIndex * totalTrees + safeTreeIndex + currentTreeProgress

    const percentage = parseFloat(
        ((completedEquivalentTrees / totalEvaluationTrees) * 100).toFixed(1)
    )

    return Math.max(0, Math.min(100, percentage))
}