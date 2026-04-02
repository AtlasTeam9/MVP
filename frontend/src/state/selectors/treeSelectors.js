import { buildDependenciesByRequirement } from '@shared/treeUtils'

export const selectTrees = (state) => (Array.isArray(state?.trees) ? state.trees : [])

let lastTreesRef = null
let lastDependenciesByRequirement = {}

export const selectDependenciesByRequirement = (state) => {
    const trees = selectTrees(state)

    if (trees === lastTreesRef) {
        return lastDependenciesByRequirement
    }

    lastTreesRef = trees
    lastDependenciesByRequirement = buildDependenciesByRequirement(trees)
    return lastDependenciesByRequirement
}
