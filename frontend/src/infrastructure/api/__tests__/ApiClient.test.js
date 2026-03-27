import { describe, it, expect, vi, beforeEach } from 'vitest'
import IApiClient from '../IApiClient'

// Creation of a mock for axios
vi.mock('axios', () => ({
    default: { create: vi.fn(() => axiosInstance) },
}))

let axiosInstance
let AxiosApiClient

async function setupAxiosMock() {
    vi.resetModules()
    axiosInstance = { get: vi.fn(), post: vi.fn() }
    const mod = await import('../AxiosApiClient')
    AxiosApiClient = mod.default
}

// Unit tests for abstract class IApiClient behavior
describe('IApiClient — instantiation', () => {
    it('cannot be instantiated directly', () => {
        expect(() => new IApiClient()).toThrow(
            'IApiClient is an abstract class and cannot be instantiated.'
        )
    })

    it('can be extended with valid implementations', () => {
        class ConcreteClient extends IApiClient {
            get() {
                return Promise.resolve({})
            }
            post() {
                return Promise.resolve({})
            }
        }
        expect(() => new ConcreteClient()).not.toThrow()
    })
})

// Unit tests for unimplemented methods in IApiClient
describe('IApiClient — unimplemented methods', () => {
    it('throws error if get() is not implemented in the subclass', () => {
        class BrokenClient extends IApiClient {
            post() {}
        }
        const client = new BrokenClient()
        expect(() => client.get()).toThrow("Method 'get' not implemented.")
    })

    it('throws error if post() is not implemented in the subclass', () => {
        class BrokenClient extends IApiClient {
            get() {}
        }
        const client = new BrokenClient()
        expect(() => client.post()).toThrow("Method 'post' not implemented.")
    })
})

// Setup the Axios mock before each testsuite to ensure isolation and reset of mock states
beforeEach(setupAxiosMock)

// Unit tests for AxiosApiClient get() method
describe('AxiosApiClient — get()', () => {
    it('give back response data', async () => {
        axiosInstance.get.mockResolvedValue({ data: { id: 1, name: 'Router' } })
        const data = await AxiosApiClient.get('/devices')
        expect(data).toEqual({ id: 1, name: 'Router' })
        expect(axiosInstance.get).toHaveBeenCalledWith('/devices', { params: {} })
    })

    it('passes query parameters correctly', async () => {
        axiosInstance.get.mockResolvedValue({ data: [] })
        await AxiosApiClient.get('/devices', { active: true })
        expect(axiosInstance.get).toHaveBeenCalledWith('/devices', { params: { active: true } })
    })

    it('propagates network errors', async () => {
        axiosInstance.get.mockRejectedValue(new Error('Network Error'))
        await expect(AxiosApiClient.get('/devices')).rejects.toThrow('Network Error')
    })
})

// Unit tests for AxiosApiClient post() method
describe('AxiosApiClient — post()', () => {
    it('sends data and returns the response', async () => {
        const payload = { deviceName: 'Switch', assets: [] }
        axiosInstance.post.mockResolvedValue({ data: { id: 42, ...payload } })
        const data = await AxiosApiClient.post('/devices', payload)
        expect(data).toMatchObject({ id: 42, deviceName: 'Switch' })
        expect(axiosInstance.post).toHaveBeenCalledWith('/devices', payload)
    })

    it('propagates network errors', async () => {
        axiosInstance.post.mockRejectedValue(new Error('Network Error'))
        await expect(AxiosApiClient.post('/devices', {})).rejects.toThrow('Network Error')
    })
})
