import { IApiClient } from '@application/ports/IApiClient'

class ApiClientService {
    constructor(port) {
        if (
            !port ||
            typeof port.get !== 'function' ||
            typeof port.post !== 'function' ||
            typeof port.delete !== 'function'
        ) {
            throw new Error('ApiClient port must implement get, post and delete')
        }

        this.port = port
    }

    get(url, config = {}) {
        return this.port.get(url, config)
    }

    post(url, data, config = {}) {
        return this.port.post(url, data, config)
    }

    delete(url, config = {}) {
        return this.port.delete(url, config)
    }
}

export function createApiClientService(port) {
    return new ApiClientService(port)
}

export default ApiClientService
export { IApiClient }
