import axios from 'axios'
import IApiClient from './IApiClient'

class AxiosApiClient extends IApiClient {
    constructor() {
        super()
        this.baseURL = 'http://127.0.0.1:8000/api/v1' // Python backend API URL
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    async get(url, config = {}) {
        const response = await this.axiosInstance.get(url, config)
        return response.data
    }

    async post(url, data, config = {}) {
        const headers = data instanceof FormData ? {} : { 'Content-Type': 'application/json' }

        const response = await this.axiosInstance.post(url, data, {
            headers: { ...headers, ...config.headers },
        })
        return response.data
    }

    async delete(url, config = {}) {
        const response = await this.axiosInstance.delete(url, config)
        return response.data
    }
}

// Export a singleton instance of AxiosApiClient
const apiClient = new AxiosApiClient()
export default apiClient
