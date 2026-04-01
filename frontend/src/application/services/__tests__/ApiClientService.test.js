import { describe, expect, it, vi } from 'vitest'
import ApiClientService, { createApiClientService } from '@application/services/ApiClientService'

describe('ApiClientService', () => {
    it('throws when initialized with invalid port', () => {
        expect(() => createApiClientService({})).toThrow(
            'ApiClient port must implement get, post and delete'
        )
    })

    it('delegates get/post/delete to provided port', async () => {
        const port = {
            get: vi.fn().mockResolvedValue({ ok: true }),
            post: vi.fn().mockResolvedValue({ created: true }),
            delete: vi.fn().mockResolvedValue({ deleted: true }),
        }

        const service = createApiClientService(port)

        await expect(service.get('/trees/')).resolves.toEqual({ ok: true })
        await expect(service.post('/session/create_session', {})).resolves.toEqual({
            created: true,
        })
        await expect(service.delete('/session/1')).resolves.toEqual({ deleted: true })

        expect(port.get).toHaveBeenCalledWith('/trees/', {})
        expect(port.post).toHaveBeenCalledWith('/session/create_session', {}, {})
        expect(port.delete).toHaveBeenCalledWith('/session/1', {})
    })
})
