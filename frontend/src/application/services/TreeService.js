import { apiClientService } from '@application/services/AppServices'
import { DecisionTree } from '@domain/DecisionTree'
import useTreeStore from '@state/TreeStore'

class TreeService {
    async loadTrees() {
        const response = await apiClientService.get('/trees/')
        const normalizedTrees = Array.isArray(response)
            ? response.map((tree) => DecisionTree.fromApi(tree))
            : []

        useTreeStore.getState().setTrees(normalizedTrees)

        return normalizedTrees
    }

    // Clear all trees from the store
    clearTrees() {
        useTreeStore.getState().clearStore()
    }
}

export default new TreeService()
