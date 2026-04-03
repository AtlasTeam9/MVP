export class IApiClient {
    constructor() {
        if (this.constructor === IApiClient) {
            throw new Error('IApiClient is an abstract class and cannot be instantiated.')
        }
    }

    get(...args) {
        void args
        throw new Error("Method 'get' not implemented.")
    }

    post(...args) {
        void args
        throw new Error("Method 'post' not implemented.")
    }

    delete(...args) {
        void args
        throw new Error("Method 'delete' not implemented.")
    }
}
