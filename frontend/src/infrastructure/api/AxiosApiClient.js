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

    async get(url, params = {}) {
        const response = await this.axiosInstance.get(url, { params })
        return response.data
    }

    async post(url, data) {
        const response = await this.axiosInstance.post(url, data)
        return response.data
    }
}

// Export a singleton instance of AxiosApiClient
const apiClient = new AxiosApiClient()
export default apiClient
