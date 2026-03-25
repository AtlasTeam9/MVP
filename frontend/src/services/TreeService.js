import apiClient from '../infrastructure/api/AxiosApiClient'
import useTreeStore from '../store/TreeStore'

class TreeService {
    async loadTrees() {
        try {
            useTreeStore.getState().setIsLoading(true)

            const response = await apiClient.get('/trees/')

            useTreeStore.getState().setTrees(response)
            useTreeStore.getState().setError(null)

            // TODO: eliminare
            console.log('Alberi caricati dal backend e salvati nello TreeStore.')

            return response
        } catch (error) {
            console.error('Errore nel caricamento dei trees:', error)
            useTreeStore.getState().setError(error.message)
            throw error
        } finally {
            useTreeStore.getState().setIsLoading(false)
        }
    }
}

export default new TreeService()
