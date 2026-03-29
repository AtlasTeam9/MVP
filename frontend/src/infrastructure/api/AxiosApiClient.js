import axios from 'axios'
import IApiClient from './IApiClient'
import { mapToAppError } from '../errors/errorMapper'

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
        try {
            const response = await this.axiosInstance.get(url, config)
            return response.data
        } catch (error) {
            throw mapToAppError(error)
        }
    }

    async post(url, data, config = {}) {
        try {
            const headers = data instanceof FormData ? {} : { 'Content-Type': 'application/json' }

            const response = await this.axiosInstance.post(url, data, {
                ...config,
                headers: { ...headers, ...(config.headers || {}) },
            })
            return response.data
        } catch (error) {
            throw mapToAppError(error)
        }
    }

    async delete(url, config = {}) {
        try {
            const response = await this.axiosInstance.delete(url, config)
            return response.data
        } catch (error) {
            throw mapToAppError(error)
        }
    }
}

// Export a singleton instance of AxiosApiClient
const apiClient = new AxiosApiClient()
export default apiClient

// Export the base URL for use in other parts of the application
export const API_BASE_URL = apiClient.baseURL
