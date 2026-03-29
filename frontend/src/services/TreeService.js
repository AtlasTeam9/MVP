import apiClient from '../infrastructure/api/AxiosApiClient'
import { DecisionTree } from '../domain/DecisionTree'
import useTreeStore from '../store/TreeStore'
import useUIStore from '../store/UIStore'

class TreeService {
    async loadTrees() {
        try {
            useUIStore.getState().setTreeLoading(true)

            const response = await apiClient.get('/trees/')
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
