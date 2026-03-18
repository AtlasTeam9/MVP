import { describe, it, expect, vi, beforeEach } from 'vitest'
import IApiClient from '../IApiClient'

// va dichiarato qui, al top level
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

// ---------------------------------------------------------------------------
// IApiClient — istanziazione
// ---------------------------------------------------------------------------
describe('IApiClient — istanziazione', () => {
    it('non può essere istanziata direttamente', () => {
        expect(() => new IApiClient()).toThrow(
            'IApiClient is an abstract class and cannot be instantiated.'
        )
    })

    it('può essere estesa con implementazioni valide', () => {
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

describe('IApiClient — metodi non implementati', () => {
    it('lancia errore se get() non è implementato nella sottoclasse', () => {
        class BrokenClient extends IApiClient {
            post() {}
        }
        const client = new BrokenClient()
        expect(() => client.get()).toThrow("Method 'get' not implemented.")
    })

    it('lancia errore se post() non è implementato nella sottoclasse', () => {
        class BrokenClient extends IApiClient {
            get() {}
        }
        const client = new BrokenClient()
        expect(() => client.post()).toThrow("Method 'post' not implemented.")
    })
})

// ---------------------------------------------------------------------------
// AxiosApiClient — setup condiviso
// --------------------------------------------------------------------------

beforeEach(setupAxiosMock)

describe('AxiosApiClient — get()', () => {
    it('restituisce i dati della risposta', async () => {
        axiosInstance.get.mockResolvedValue({ data: { id: 1, name: 'Router' } })
        const data = await AxiosApiClient.get('/devices')
        expect(data).toEqual({ id: 1, name: 'Router' })
        expect(axiosInstance.get).toHaveBeenCalledWith('/devices', { params: {} })
    })

    it('passa i parametri query correttamente', async () => {
        axiosInstance.get.mockResolvedValue({ data: [] })
        await AxiosApiClient.get('/devices', { active: true })
        expect(axiosInstance.get).toHaveBeenCalledWith('/devices', { params: { active: true } })
    })

    it('propaga gli errori di rete', async () => {
        axiosInstance.get.mockRejectedValue(new Error('Network Error'))
        await expect(AxiosApiClient.get('/devices')).rejects.toThrow('Network Error')
    })
})

describe('AxiosApiClient — post()', () => {
    it('invia i dati e restituisce la risposta', async () => {
        const payload = { deviceName: 'Switch', assets: [] }
        axiosInstance.post.mockResolvedValue({ data: { id: 42, ...payload } })
        const data = await AxiosApiClient.post('/devices', payload)
        expect(data).toMatchObject({ id: 42, deviceName: 'Switch' })
        expect(axiosInstance.post).toHaveBeenCalledWith('/devices', payload)
    })

    it('propaga gli errori di rete', async () => {
        axiosInstance.post.mockRejectedValue(new Error('Network Error'))
        await expect(AxiosApiClient.post('/devices', {})).rejects.toThrow('Network Error')
    })
})
