import apiClient from '../infrastructure/api/AxiosApiClient'

class TreeService {
    async loadTrees() {
        try {
            const response = await apiClient.get('/trees/')
            console.log('Trees loaded into the backend:', response)
            return response
        } catch (error) {
            console.error('Errore nel caricamento dei trees:', error) // TODO: sistemare
            throw error
        }
    }
}

export default new TreeService()
