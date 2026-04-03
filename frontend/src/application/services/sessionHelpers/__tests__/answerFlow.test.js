import { describe, expect, it, vi } from 'vitest'

import {
    applyAnswerTransition,
    postForwardAnswer,
    postGoBackAnswer,
    shouldUseGoBackFlow,
} from '@application/services/sessionHelpers/answerFlow'

describe('answerFlow helpers', () => {
    it('applyAnswerTransition stores answer, clears future and exits resume mode', () => {
        const state = {
            isResumeMode: true,
            selectAnswer: vi.fn(),
            clearFuture: vi.fn(),
            setResumeMode: vi.fn(),
        }
        const sessionStore = {
            getState: () => state,
        }

        applyAnswerTransition(sessionStore, true)

        expect(state.selectAnswer).toHaveBeenCalledWith(true)
        expect(state.clearFuture).toHaveBeenCalledTimes(1)
        expect(state.setResumeMode).toHaveBeenCalledWith(false)
    })

    it('shouldUseGoBackFlow depends on futureHistory and resume mode', () => {
        const sessionStoreA = {
            getState: () => ({ futureHistory: [], isResumeMode: false }),
        }
        const sessionStoreB = {
            getState: () => ({ futureHistory: [{}], isResumeMode: false }),
        }
        const sessionStoreC = {
            getState: () => ({ futureHistory: [], isResumeMode: true }),
        }

        expect(shouldUseGoBackFlow(sessionStoreA)).toBe(false)
        expect(shouldUseGoBackFlow(sessionStoreB)).toBe(true)
        expect(shouldUseGoBackFlow(sessionStoreC)).toBe(true)
    })

    it('postGoBackAnswer sends expected payload', async () => {
        const apiClient = { post: vi.fn().mockResolvedValue({ ok: true }) }

        await postGoBackAnswer(apiClient, 's1', false, {
            currentAssetIndex: 1,
            currentNode: { id: 'node5' },
            currentTreeIndex: 2,
        })

        expect(apiClient.post).toHaveBeenCalledWith('/session/s1/go_back', {
            'target_asset_index': 1,
            'target_node_id': 'node5',
            'target_tree_index': 2,
            'new_answer': false,
        })
    })

    it('postForwardAnswer sends expected payload', async () => {
        const apiClient = { post: vi.fn().mockResolvedValue({ ok: true }) }

        await postForwardAnswer(apiClient, 's2', true)

        expect(apiClient.post).toHaveBeenCalledWith('/session/s2/answer', { answer: true })
    })
})
