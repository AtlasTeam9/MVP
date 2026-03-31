import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAsyncHandler, getHandlerConfigs } from '../sessionHooks/sessionHandlersConfig'

const mocks = vi.hoisted(() => ({
    sessionService: {
        sendAnswer: vi.fn(),
        previousStep: vi.fn(),
        forwardStep: vi.fn(),
        saveAndExit: vi.fn(),
    },
    exportService: {
        exportSessionAsJSON: vi.fn(),
    },
    sessionStore: {
        getState: vi.fn(),
    },
    notifications: {
        notifyError: vi.fn(),
    },
}))

vi.mock('../../services/SessionService', () => ({
    default: mocks.sessionService,
}))

vi.mock('../../services/ExportService', () => ({
    default: mocks.exportService,
}))

vi.mock('../../store/SessionStore', () => ({
    default: mocks.sessionStore,
}))

vi.mock('../../infrastructure/notifications/NotificationManager', () => ({
    default: mocks.notifications,
}))

function resetAllMocks() {
    mocks.sessionService.sendAnswer.mockReset()
    mocks.sessionService.previousStep.mockReset()
    mocks.sessionService.forwardStep.mockReset()
    mocks.sessionService.saveAndExit.mockReset()
    mocks.exportService.exportSessionAsJSON.mockReset()
    mocks.sessionStore.getState.mockReset()
    mocks.notifications.notifyError.mockReset()
}

function setDefaultSessionState() {
    mocks.sessionStore.getState.mockReturnValue({
        sessionId: 'session-1',
        pastHistory: [{ assetIndex: 0, treeIndex: 1, nodeId: 'node-1', answer: true }],
    })
}

describe('sessionHandlersConfig - createAsyncHandler success flow', () => {
    beforeEach(() => {
        resetAllMocks()
        setDefaultSessionState()
    })

    it('createAsyncHandler executes success flow and resets flags', async () => {
        const setIsLoading = vi.fn(),
            setIsSaving = vi.fn()
        const setError = vi.fn()
        const asyncFn = vi.fn().mockResolvedValue(undefined)
        const onSuccess = vi.fn()

        const handler = createAsyncHandler(
            setIsLoading,
            setIsSaving,
            setError,
            asyncFn,
            'error',
            true,
            onSuccess
        )

        await handler()

        expect(setIsLoading).toHaveBeenNthCalledWith(1, true)
        expect(setIsSaving).toHaveBeenNthCalledWith(1, true)
        expect(setError).toHaveBeenCalledWith(null)
        expect(asyncFn).toHaveBeenCalledTimes(1)
        expect(onSuccess).toHaveBeenCalledTimes(1)
        expect(setIsLoading).toHaveBeenLastCalledWith(false)
        expect(setIsSaving).toHaveBeenLastCalledWith(false)
    })

})

describe('sessionHandlersConfig - createAsyncHandler error flow', () => {
    beforeEach(() => {
        resetAllMocks()
        setDefaultSessionState()
    })

    it('createAsyncHandler handles error flow', async () => {
        const setIsLoading = vi.fn()
        const setIsSaving = vi.fn()
        const setError = vi.fn()
        const testError = new Error('boom')
        const asyncFn = vi.fn().mockRejectedValue(testError)

        const handler = createAsyncHandler(
            setIsLoading,
            setIsSaving,
            setError,
            asyncFn,
            'custom error',
            false,
            undefined
        )

        await handler()

        expect(setError).toHaveBeenCalledWith('custom error')
        expect(mocks.notifications.notifyError).toHaveBeenCalledWith(testError)
        expect(setIsLoading).toHaveBeenLastCalledWith(false)
        expect(setIsSaving).toHaveBeenLastCalledWith(false)
    })

    it('createAsyncHandler can suppress toast notifications', async () => {
        const setIsLoading = vi.fn()
        const setIsSaving = vi.fn()
        const setError = vi.fn()
        const testError = new Error('boom')
        const asyncFn = vi.fn().mockRejectedValue(testError)

        const handler = createAsyncHandler(
            setIsLoading,
            setIsSaving,
            setError,
            asyncFn,
            'custom error',
            false,
            undefined,
            false
        )

        await handler()

        expect(setError).toHaveBeenCalledWith('custom error')
        expect(mocks.notifications.notifyError).not.toHaveBeenCalled()
    })
})

describe('sessionHandlersConfig - getHandlerConfigs', () => {
    beforeEach(() => {
        resetAllMocks()
        setDefaultSessionState()
    })

    it('getHandlerConfigs wires navigate callbacks and save/export flow', async () => {
        const navigate = vi.fn()
        const configs = getHandlerConfigs(navigate)

        const homeConfig = configs.find((cfg) => cfg.name === 'handleHomeClick')
        const saveConfig = configs.find((cfg) => cfg.name === 'handleSaveAndExitClick')

        await homeConfig.fn()
        homeConfig.onSuccess()

        await saveConfig.fn()
        saveConfig.onSuccess()

        expect(mocks.sessionService.saveAndExit).toHaveBeenCalledTimes(2)
        expect(mocks.exportService.exportSessionAsJSON).toHaveBeenCalledTimes(1)

        const exportedAnswers = mocks.exportService.exportSessionAsJSON.mock.calls[0][1]
        expect(exportedAnswers[0]['asset_index']).toBe(0)
        expect(exportedAnswers[0]['tree_index']).toBe(1)
        expect(exportedAnswers[0]['node_id']).toBe('node-1')
        expect(exportedAnswers[0]['answer']).toBe(true)

        expect(navigate).toHaveBeenCalledWith('/')
    })

    it('marks local runner actions to use inline-only errors', () => {
        const configs = getHandlerConfigs(vi.fn())

        const yesConfig = configs.find((cfg) => cfg.name === 'handleYesClick')
        const noConfig = configs.find((cfg) => cfg.name === 'handleNoClick')
        const backConfig = configs.find((cfg) => cfg.name === 'handleBackClick')
        const forwardConfig = configs.find((cfg) => cfg.name === 'handleForwardClick')

        expect(yesConfig.showToast).toBe(false)
        expect(noConfig.showToast).toBe(false)
        expect(backConfig.showToast).toBe(false)
        expect(forwardConfig.showToast).toBe(false)
    })
})
