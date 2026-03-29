import apiClient from '../infrastructure/api/AxiosApiClient'
import useTreeStore from '../store/TreeStore'
import useUIStore from '../store/UIStore'

class TreeService {
    async loadTrees() {
        try {
            useUIStore.getState().setTreeLoading(true)

            const response = await apiClient.get('/trees/')

            useTreeStore.getState().setTrees(response)
            useTreeStore.getState().setError(null)

            return response
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
