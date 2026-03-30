import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    sessionState: {
        sessionId: 'session-1',
        currentAssetIndex: 0,
        currentTreeIndex: 0,
        currentNode: { id: 'node1' },
        futureHistory: [],
        isResumeMode: true,
        setCurrentNode: vi.fn(),
        setDevicePosition: vi.fn(),
    },
    applyAnswerTransition: vi.fn(),
    shouldUseGoBackFlow: vi.fn(),
    postGoBackAnswer: vi.fn(),
    postForwardAnswer: vi.fn(),
}))

vi.mock('../../store/SessionStore', () => ({
    default: {
        getState: () => mocks.sessionState,
    },
}))

vi.mock('../../store/DeviceStore', () => ({
    default: {
        getState: () => ({ currentDevice: null, setDevice: vi.fn() }),
    },
}))

vi.mock('../../store/TreeStore', () => ({
    default: {
        getState: () => ({ trees: [], getNodeByTreeIndexAndNodeId: vi.fn() }),
    },
}))

vi.mock('../../store/ResultStore', () => ({
    default: {
        getState: () => ({ setResults: vi.fn() }),
    },
}))

vi.mock('../../infrastructure/api/AxiosApiClient', () => ({
    default: { post: vi.fn() },
}))

vi.mock('../sessionHelpers', () => ({
    applyAnswerTransition: (...args) => mocks.applyAnswerTransition(...args),
    shouldUseGoBackFlow: (...args) => mocks.shouldUseGoBackFlow(...args),
    postGoBackAnswer: (...args) => mocks.postGoBackAnswer(...args),
    postForwardAnswer: (...args) => mocks.postForwardAnswer(...args),
    clearLocalSessionState: vi.fn(),
    createDeviceFromApiResponse: vi.fn(),
    deleteRemoteSessionIfPresent: vi.fn(),
    mapResultsToRequirementResults: vi.fn(),
}))

import SessionService from '../SessionService'

describe('SessionService.sendAnswer', () => {
    beforeEach(() => {
        mocks.applyAnswerTransition.mockReset()
        mocks.shouldUseGoBackFlow.mockReset()
        mocks.postGoBackAnswer.mockReset()
        mocks.postForwardAnswer.mockReset()

        mocks.sessionState = {
            sessionId: 'session-1',
            currentAssetIndex: 0,
            currentTreeIndex: 0,
            currentNode: { id: 'node1' },
            futureHistory: [],
            isResumeMode: true,
            setCurrentNode: vi.fn(),
            setDevicePosition: vi.fn(),
        }

        mocks.shouldUseGoBackFlow.mockImplementation((sessionStore) => {
            const state = sessionStore.getState()
            return state.futureHistory.length > 0 || state.isResumeMode
        })

        mocks.applyAnswerTransition.mockImplementation(() => {
            // Mirrors real behavior: resume mode is cleared as part of answer transition.
            mocks.sessionState.isResumeMode = false
        })

        mocks.postGoBackAnswer.mockResolvedValue({ found: false })
        mocks.postForwardAnswer.mockResolvedValue({ treeCompleted: false })
    })

    it('uses go_back flow on first resumed answer even if transition clears resume mode', async () => {
        await SessionService.sendAnswer(true)

        expect(mocks.postGoBackAnswer).toHaveBeenCalledTimes(1)
        expect(mocks.postForwardAnswer).not.toHaveBeenCalled()
    })
})
