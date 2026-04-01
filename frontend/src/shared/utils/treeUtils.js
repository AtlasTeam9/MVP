export function buildDependenciesByRequirement(trees = []) {
    if (!Array.isArray(trees)) {
        return {}
    }

    return trees.reduce((acc, tree) => {
        if (!tree || typeof tree !== 'object') {
            return acc
        }

        const requirementId = tree.id || tree.requirement_id
        if (!requirementId) {
            return acc
        }

        acc[requirementId] = Array.isArray(tree.dependencies) ? tree.dependencies : []
        return acc
    }, {})
}

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