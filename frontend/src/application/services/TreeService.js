import { apiClientService } from '@application/services/AppServices'
import { DecisionTree } from '@domain/DecisionTree'
import useTreeStore from '@state/TreeStore'
import useUIStore from '@state/UIStore'

class TreeService {
    async loadTrees() {
        try {
            useUIStore.getState().setTreeLoading(true)

            const response = await apiClientService.get('/trees/')
            const normalizedTrees = Array.isArray(response)
                ? response.map((tree) => DecisionTree.fromApi(tree))
                : []

            useTreeStore.getState().setTrees(normalizedTrees)
            useTreeStore.getState().setError(null)

            return normalizedTrees
        } catch (error) {
            useTreeStore.getState().setError(error.message)
            throw error
        } finally {
            useUIStore.getState().setTreeLoading(false)
        }
    }

    // Clear all trees from the store
    clearTrees() {
        useTreeStore.getState().clearStore()
    }
}

export default new TreeService()
