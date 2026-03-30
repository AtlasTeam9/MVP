import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    apiClient: {
        post: vi.fn(),
    },
    sessionState: {
        sessionId: 'session-1',
        currentAssetIndex: 0,
        currentTreeIndex: 0,
        currentNode: { id: 'node1' },
        futureHistory: [],
        isResumeMode: true,
        selectAnswer: vi.fn(),
        clearFuture: vi.fn(),
        setResumeMode: vi.fn(),
        setCurrentNode: vi.fn(),
        setDevicePosition: vi.fn(),
        clearStore: vi.fn(),
        setSessionId: vi.fn(),
        setSessionUploaded: vi.fn(),
        importPastHistory: vi.fn(),
        setResultsPerAsset: vi.fn(),
        setTestFinished: vi.fn(),
        truncateHistoryByPosition: vi.fn(),
    },
    deviceState: {
        currentDevice: null,
        setDevice: vi.fn(),
    },
    treeState: {
        trees: [],
        getNodeByTreeIndexAndNodeId: vi.fn(),
    },
    resultState: {
        setResults: vi.fn(),
        clearStore: vi.fn(),
    },
    applyAnswerTransition: vi.fn(),
    shouldUseGoBackFlow: vi.fn(),
    postGoBackAnswer: vi.fn(),
    postForwardAnswer: vi.fn(),
    clearLocalSessionState: vi.fn(),
    createDeviceFromApiResponse: vi.fn(),
    deleteRemoteSessionIfPresent: vi.fn(),
    mapResultsToRequirementResults: vi.fn(),
}))

vi.mock('../../store/SessionStore', () => ({
    default: {
        getState: () => mocks.sessionState,
    },
}))

vi.mock('../../store/DeviceStore', () => ({
    default: {
        getState: () => mocks.deviceState,
    },
}))

vi.mock('../../store/TreeStore', () => ({
    default: {
        getState: () => mocks.treeState,
    },
}))

vi.mock('../../store/ResultStore', () => ({
    default: {
        getState: () => mocks.resultState,
    },
}))

vi.mock('../../infrastructure/api/AxiosApiClient', () => ({
    default: mocks.apiClient,
}))

vi.mock('../sessionHelpers', () => ({
    applyAnswerTransition: (...args) => mocks.applyAnswerTransition(...args),
    shouldUseGoBackFlow: (...args) => mocks.shouldUseGoBackFlow(...args),
    postGoBackAnswer: (...args) => mocks.postGoBackAnswer(...args),
    postForwardAnswer: (...args) => mocks.postForwardAnswer(...args),
    clearLocalSessionState: (...args) => mocks.clearLocalSessionState(...args),
    createDeviceFromApiResponse: (...args) => mocks.createDeviceFromApiResponse(...args),
    deleteRemoteSessionIfPresent: (...args) => mocks.deleteRemoteSessionIfPresent(...args),
    mapResultsToRequirementResults: (...args) => mocks.mapResultsToRequirementResults(...args),
}))

import deviceService from '../DeviceService'
import SessionService from '../SessionService'

function createSessionState() {
    return {
        sessionId: 'session-1',
        currentAssetIndex: 0,
        currentTreeIndex: 0,
        currentNode: { id: 'node1' },
        futureHistory: [],
        isResumeMode: true,
        selectAnswer: vi.fn(),
        clearFuture: vi.fn(),
        setResumeMode: vi.fn(),
        setCurrentNode: vi.fn(),
        setDevicePosition: vi.fn(),
        clearStore: vi.fn(),
        setSessionId: vi.fn(),
        setSessionUploaded: vi.fn(),
        importPastHistory: vi.fn(),
        setResultsPerAsset: vi.fn(),
        setTestFinished: vi.fn(),
        truncateHistoryByPosition: vi.fn(),
    }
}

function createDeviceState() {
    return {
        currentDevice: null,
        setDevice: vi.fn(),
    }
}

function createTreeState() {
    return {
        trees: [],
        getNodeByTreeIndexAndNodeId: vi.fn(),
    }
}

function createResultState() {
    return {
        setResults: vi.fn(),
        clearStore: vi.fn(),
    }
}

function resetSessionAnswerMocks() {
    mocks.applyAnswerTransition.mockReset()
    mocks.shouldUseGoBackFlow.mockReset()
    mocks.postGoBackAnswer.mockReset()
    mocks.postForwardAnswer.mockReset()
}

function setupSessionDefaults() {
    mocks.sessionState = createSessionState()
    mocks.deviceState = createDeviceState()
    mocks.treeState = createTreeState()
    mocks.resultState = createResultState()
    mocks.apiClient.post.mockReset()

    mocks.shouldUseGoBackFlow.mockImplementation((sessionStore) => {
        const state = sessionStore.getState()
        return state.futureHistory.length > 0 || state.isResumeMode
    })

    mocks.applyAnswerTransition.mockImplementation(() => {
        // Mirrors real behavior: resume mode is cleared as part of answer transition.
        mocks.sessionState.isResumeMode = false
    })

    mocks.postGoBackAnswer.mockResolvedValue({ found: false })
    mocks.postForwardAnswer.mockResolvedValue({ 'tree_completed': false })

    mocks.clearLocalSessionState.mockReset()
    mocks.clearLocalSessionState.mockImplementation((sessionStore, resultStore) => {
        sessionStore.getState().clearStore()
        resultStore.getState().clearStore()
    })

    mocks.createDeviceFromApiResponse.mockReset()
    mocks.createDeviceFromApiResponse.mockImplementation((device) => ({
        normalized: true,
        ...device,
    }))

    mocks.deleteRemoteSessionIfPresent.mockReset()
    mocks.deleteRemoteSessionIfPresent.mockResolvedValue(undefined)

    mocks.mapResultsToRequirementResults.mockReset()
    mocks.mapResultsToRequirementResults.mockImplementation((results) => results)
}

describe('SessionService.sendAnswer', () => {
    beforeEach(() => {
        resetSessionAnswerMocks()
        setupSessionDefaults()
    })

    it('uses go_back flow on first resumed answer even if transition clears resume mode', async () => {
        await SessionService.sendAnswer(true)

        expect(mocks.postGoBackAnswer).toHaveBeenCalledTimes(1)
        expect(mocks.postForwardAnswer).not.toHaveBeenCalled()
    })

    it('keeps position and node aligned when tree_completed changes asset', async () => {
        const nextNode = { id: 'node7', label: 'Node 7' }
        mocks.shouldUseGoBackFlow.mockReturnValue(false)
        mocks.postForwardAnswer.mockResolvedValue({
            'tree_completed': true,
            'session_finished': false,
            'current_asset_index': 1,
            'current_tree_index': 2,
            'next_node_id': 'node7',
        })
        mocks.treeState.getNodeByTreeIndexAndNodeId.mockReturnValue(nextNode)

        await SessionService.sendAnswer(true)

        expect(mocks.sessionState.setDevicePosition).toHaveBeenCalledWith(1, 2, 'node7')
        expect(mocks.sessionState.setCurrentNode).toHaveBeenCalledWith(nextNode)
    })

    it('clearSession clears local state even when backend deletion fails', async () => {
        mocks.deleteRemoteSessionIfPresent.mockRejectedValue(new Error('backend unavailable'))

        await expect(SessionService.clearSession()).resolves.toBeUndefined()
        expect(mocks.clearLocalSessionState).toHaveBeenCalledTimes(1)
        expect(mocks.sessionState.clearStore).toHaveBeenCalledTimes(1)
        expect(mocks.resultState.clearStore).toHaveBeenCalledTimes(1)
    })

    it('clearSession deletes remote session then clears local state', async () => {
        await expect(SessionService.clearSession()).resolves.toBeUndefined()

        expect(mocks.deleteRemoteSessionIfPresent).toHaveBeenCalledTimes(1)
        expect(mocks.clearLocalSessionState).toHaveBeenCalledTimes(1)
    })
})

describe('SessionService loadSessionFromFile active session', () => {
    beforeEach(() => {
        setupSessionDefaults()
    })

    it('loadSessionFromFile maps backend payload and updates all stores when session is active', async () => {
        const mappedDevice = {
            id: 'mapped-device',
            assets: [{ id: 'asset-1' }],
        }
        const mappedResults = [{ code: 'R1', status: 'ok' }]
        const currentNode = { id: 'node9', label: 'Node 9' }
        const response = {
            'session_id': 'session-99',
            'device': { 'device_name': 'my device' },
            'answer': [{ 'asset_index': 0, 'tree_index': 1, 'node_id': 'node3', 'answer': true }],
            'position': {
                'current_asset_index': 1,
                'current_tree_index': 2,
                'current_node_id': 'node9',
            },
            'aggregate_results': { R1: 'ok' },
            'results': { 'asset-1': { R1: 'ok' } },
            'is_finished': false,
        }

        mocks.createDeviceFromApiResponse.mockReturnValue(mappedDevice)
        mocks.mapResultsToRequirementResults.mockReturnValue(mappedResults)
        mocks.treeState.getNodeByTreeIndexAndNodeId.mockReturnValue(currentNode)
        mocks.apiClient.post.mockResolvedValue(response)

        const loaded = await SessionService.loadSessionFromFile({ name: 'saved-session.json' })

        expect(mocks.apiClient.post).toHaveBeenCalledWith(
            '/session/load_session_from_file',
            expect.any(FormData),
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        expect(mocks.sessionState.setSessionId).toHaveBeenCalledWith('session-99')
        expect(mocks.sessionState.setSessionUploaded).toHaveBeenCalledWith(true)
        expect(mocks.deviceState.setDevice).toHaveBeenCalledWith(mappedDevice)
        expect(mocks.sessionState.importPastHistory).toHaveBeenCalledWith(response.answer)
        expect(mocks.sessionState.setDevicePosition).toHaveBeenCalledWith(1, 2, 'node9')
        expect(mocks.sessionState.setCurrentNode).toHaveBeenCalledWith(currentNode)
        expect(mocks.mapResultsToRequirementResults).toHaveBeenCalledWith({ R1: 'ok' })
        expect(mocks.resultState.setResults).toHaveBeenCalledWith(mappedResults)
        expect(mocks.sessionState.setResultsPerAsset).toHaveBeenCalledWith(response.results)
        expect(mocks.sessionState.setTestFinished).toHaveBeenCalledWith(false)
        expect(loaded).toEqual({ results: mappedResults, isFinished: false })
    })
})

describe('SessionService loadSessionFromFile finished session', () => {
    beforeEach(() => {
        setupSessionDefaults()
    })

    it('loadSessionFromFile skips node positioning when backend marks session as finished', async () => {
        const response = {
            'session_id': 'session-100',
            'device': { 'device_name': 'completed device' },
            'answer': [],
            'position': {
                'current_asset_index': 999,
                'current_tree_index': 999,
                'current_node_id': '',
            },
            'aggregate_results': { R2: 'ko' },
            'results': { 'asset-1': { R2: 'ko' } },
            'is_finished': true,
        }
        mocks.apiClient.post.mockResolvedValue(response)

        await SessionService.loadSessionFromFile({ name: 'finished-session.json' })

        expect(mocks.sessionState.setDevicePosition).not.toHaveBeenCalled()
        expect(mocks.sessionState.setCurrentNode).not.toHaveBeenCalled()
        expect(mocks.sessionState.setTestFinished).toHaveBeenCalledWith(true)
    })
})

describe('SessionService resumeSession flow', () => {
    beforeEach(() => {
        setupSessionDefaults()
    })

    it('resumeSession returns true and updates navigation state for valid requirement and asset', () => {
        const firstNode = { id: 'node1', label: 'First node' }
        mocks.deviceState.currentDevice = {
            assets: [{ id: 'asset-1' }, { id: 'asset-2' }],
        }
        mocks.treeState.trees = [{ id: 'req-1' }, { id: 'req-2' }]
        mocks.treeState.getNodeByTreeIndexAndNodeId.mockReturnValue(firstNode)

        const resumed = SessionService.resumeSession('req-1', 'asset-2')

        expect(resumed).toBe(true)
        expect(mocks.sessionState.setDevicePosition).toHaveBeenCalledWith(1, 0, 'node1')
        expect(mocks.sessionState.setCurrentNode).toHaveBeenCalledWith(firstNode)
        expect(mocks.sessionState.truncateHistoryByPosition).toHaveBeenCalledWith(1, 0)
        expect(mocks.sessionState.clearFuture).toHaveBeenCalledTimes(1)
        expect(mocks.sessionState.setResumeMode).toHaveBeenCalledWith(true)
        expect(mocks.sessionState.setSessionUploaded).toHaveBeenCalledWith(false)
        expect(mocks.sessionState.setTestFinished).toHaveBeenCalledWith(false)
    })

    it('resumeSession returns false when ids are invalid and leaves state unchanged', () => {
        mocks.deviceState.currentDevice = {
            assets: [{ id: 'asset-1' }],
        }
        mocks.treeState.trees = [{ id: 'req-1' }]

        const resumed = SessionService.resumeSession('missing-req', 'missing-asset')

        expect(resumed).toBe(false)
        expect(mocks.sessionState.setDevicePosition).not.toHaveBeenCalled()
        expect(mocks.sessionState.setCurrentNode).not.toHaveBeenCalled()
    })
})

describe('SessionService save and clear flows', () => {
    beforeEach(() => {
        setupSessionDefaults()
    })

    it('saveAndExit clears device and local stores when backend delete succeeds', async () => {
        const clearDeviceSpy = vi.spyOn(deviceService, 'clearDevice').mockImplementation(() => {})

        await expect(SessionService.saveAndExit()).resolves.toBeUndefined()

        expect(mocks.deleteRemoteSessionIfPresent).toHaveBeenCalledTimes(1)
        expect(clearDeviceSpy).toHaveBeenCalledTimes(1)
        expect(mocks.clearLocalSessionState).toHaveBeenCalledTimes(1)

        clearDeviceSpy.mockRestore()
    })

    it('saveAndExit still clears device and local stores when backend delete fails', async () => {
        const clearDeviceSpy = vi.spyOn(deviceService, 'clearDevice').mockImplementation(() => {})
        mocks.deleteRemoteSessionIfPresent.mockRejectedValue(new Error('delete failed'))

        await expect(SessionService.saveAndExit()).resolves.toBeUndefined()

        expect(clearDeviceSpy).toHaveBeenCalledTimes(1)
        expect(mocks.clearLocalSessionState).toHaveBeenCalledTimes(1)

        clearDeviceSpy.mockRestore()
    })
})
