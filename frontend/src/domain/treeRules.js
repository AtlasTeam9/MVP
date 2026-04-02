export function filterResumableResults(results = [], trees = []) {
    const safeResults = Array.isArray(results) ? results : []
    const safeTrees = Array.isArray(trees) ? trees : []

    const noDependenciesTreeIds = safeTrees
        .filter((tree) => !tree.dependencies || tree.dependencies.length === 0)
        .map((tree) => tree.id)

    return safeResults.filter((result) => {
        if (!result || typeof result !== 'object') {
            return false
        }

        if (noDependenciesTreeIds.includes(result.code)) {
            return true
        }

        return result.status === 'PASS' || result.status === 'FAIL'
    })
}
