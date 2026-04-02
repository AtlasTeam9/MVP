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