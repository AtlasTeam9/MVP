/**
 * Calculates the test completion percentage based on current position in the evaluation flow
 * Each asset must evaluate ALL trees sequentially
 * Counts answered nodes in pastHistory for accurate per-node progress
 * @param {number} currentAssetIndex - Current asset index (0 to totalAssets-1)
 * @param {Array} pastHistory - Array of answered nodes (used to count visited nodes)
 * @param {Array} trees - Array of decision trees from TreeStore
 * @param {Array} assets - Array of assets from current device
 * @returns {number} Completion percentage (0-100)
 */
export function calculateCompletionPercentage(
    currentAssetIndex = 0,
    pastHistory = [],
    trees = [],
    assets = []
) {
    const totalAssets = assets ? assets.length : 0
    let totalNodes = 0

    if (trees && trees.length > 0) {
        trees.forEach((tree) => {
            if (tree.nodes) {
                totalNodes += Object.keys(tree.nodes).length
            }
        })
    }

    if (totalNodes === 0 || totalAssets === 0) {
        return 0
    }

    // Total evaluation nodes = each asset evaluates all nodes
    const totalEvaluationNodes = totalAssets * totalNodes

    // Count answered nodes in current asset only, without double-counting revisited nodes.
    const currentAssetEntries = pastHistory.filter(
        (entry) => entry.assetIndex === currentAssetIndex
    )
    const uniqueAnsweredNodeIds = new Set(
        currentAssetEntries.map((entry) => entry.nodeId).filter(Boolean)
    )
    const entriesWithoutNodeId = currentAssetEntries.filter((entry) => !entry.nodeId).length
    const nodesInCurrentAsset = uniqueAnsweredNodeIds.size + entriesWithoutNodeId

    // Completed nodes:
    // - All nodes from previous assets (completed assets × totalNodes each)
    // - Plus nodes answered in current asset
    const completedNodes = currentAssetIndex * totalNodes + nodesInCurrentAsset

    const percentage = parseFloat(((completedNodes / totalEvaluationNodes) * 100).toFixed(1))

    return percentage
}
