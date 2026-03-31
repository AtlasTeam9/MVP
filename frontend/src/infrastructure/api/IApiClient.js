/**
 * IApiClient Interface (Abstract Class)
 * Define must have methods for API communication: get, post and delete.
 */
export default class IApiClient {
    constructor() {
        if (this.constructor === IApiClient) {
            throw new Error('IApiClient is an abstract class and cannot be instantiated.')
        }
    }

    /**
     * @param {string} url
     * @param {any} data
     * @returns {Promise<Object>}
     */
    post() {
        throw new Error("Method 'post' not implemented.")
    }

    /**
     * @param {string} url
     * @param {Object} params
     * @returns {Promise<Object>}
     */
    get() {
        throw new Error("Method 'get' not implemented.")
    }

    /**
     * @param {string} url
     * @param {Object} config
     * @returns {Promise<Object>}
     */
    delete() {
        throw new Error("Method 'delete' not implemented.")
    }
}
