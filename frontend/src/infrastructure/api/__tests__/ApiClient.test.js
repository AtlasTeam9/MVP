import { describe, it, expect, vi, beforeEach } from 'vitest'
import IApiClient from '../IApiClient'

// Creation of a mock for axios
vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => axiosInstance),
        isAxiosError: (error) => Boolean(error?.isAxiosError),
    },
}))

let axiosInstance
let AxiosApiClient

async function setupAxiosMock() {
    vi.resetModules()
    axiosInstance = { get: vi.fn(), post: vi.fn(), delete: vi.fn() }
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
            delete() {
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

    it('throws error if delete() is not implemented in the subclass', () => {
        class BrokenClient extends IApiClient {
            get() {}
            post() {}
        }
        const client = new BrokenClient()
        expect(() => client.delete()).toThrow("Method 'delete' not implemented.")
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
        expect(axiosInstance.get).toHaveBeenCalledWith('/devices', {})
    })

    it('passes query parameters correctly', async () => {
        axiosInstance.get.mockResolvedValue({ data: [] })
        await AxiosApiClient.get('/devices', { active: true })
        expect(axiosInstance.get).toHaveBeenCalledWith('/devices', { active: true })
    })

    it('propagates network errors', async () => {
        axiosInstance.get.mockRejectedValue({ isAxiosError: true })
        await expect(AxiosApiClient.get('/devices')).rejects.toThrow(
            'Unable to reach the server. Please check your connection.'
        )
    })
})

// Unit tests for AxiosApiClient post() method
describe('AxiosApiClient — post()', () => {
    it('sends data and returns the response', async () => {
        const payload = { deviceName: 'Switch', assets: [] }
        axiosInstance.post.mockResolvedValue({ data: { id: 42, ...payload } })
        const data = await AxiosApiClient.post('/devices', payload)
        expect(data).toMatchObject({ id: 42, deviceName: 'Switch' })
        expect(axiosInstance.post).toHaveBeenCalledWith('/devices', payload, {
            headers: { 'Content-Type': 'application/json' },
        })
    })

    it('propagates network errors', async () => {
        axiosInstance.post.mockRejectedValue({ isAxiosError: true })
        await expect(AxiosApiClient.post('/devices', {})).rejects.toThrow(
            'Unable to reach the server. Please check your connection.'
        )
    })
})

describe('AxiosApiClient — delete()', () => {
    it('deletes resource and returns the response', async () => {
        axiosInstance.delete.mockResolvedValue({ data: { deleted: true } })
        const data = await AxiosApiClient.delete('/session/1/delete')
        expect(data).toEqual({ deleted: true })
        expect(axiosInstance.delete).toHaveBeenCalledWith('/session/1/delete', {})
    })

    it('propagates network errors', async () => {
        axiosInstance.delete.mockRejectedValue({ isAxiosError: true })
        await expect(AxiosApiClient.delete('/session/1/delete')).rejects.toThrow(
            'Unable to reach the server. Please check your connection.'
        )
    })
})
