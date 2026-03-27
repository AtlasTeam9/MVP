import axios from 'axios'
import IApiClient from './IApiClient'

class AxiosApiClient extends IApiClient {
    constructor() {
        super()
        this.baseURL = import.meta.env.VITE_API_BASE_URL
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

// Export the base URL for use in other parts of the application
export const API_BASE_URL = apiClient.baseURL
