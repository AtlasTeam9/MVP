/* eslint-disable camelcase */
import SessionService from '@application/services/SessionService'
import ExportService from '@application/services/ExportService'
import useSessionStore from '@state/SessionStore'
import { notificationService } from '@application/services/AppServices'

// Utility factory function to create an asynchronous handler for session actions
export const createAsyncHandler =
    (
        setIsLoading,
        setError,
        asyncFn,
        errorMsg,
        onSuccess,
        showToast = true
    ) =>
    async () => {
        try {
            setIsLoading(true)
            setError(null)
            await asyncFn()
            onSuccess?.()
        } catch (err) {
            setError(errorMsg)
            if (showToast) {
                notificationService.notifyError(err)
            }
        } finally {
            setIsLoading(false)
        }
    }

// Array of base configurations for session handlers,
// defining the function to call, error message, and optional success callback
const BASE_HANDLER_CONFIGS = [
    {
        name: 'handleYesClick',
        fn: () => SessionService.sendAnswer(true),
        errorMsg: 'Failed to submit answer. Please try again.',
        showToast: false,
    },
    {
        name: 'handleNoClick',
        fn: () => SessionService.sendAnswer(false),
        errorMsg: 'Failed to submit answer. Please try again.',
        showToast: false,
    },
    {
        name: 'handleBackClick',
        fn: () => SessionService.previousStep(),
        errorMsg: 'Failed to go back. Please try again.',
        showToast: false,
    },
    {
        name: 'handleForwardClick',
        fn: () => SessionService.forwardStep(),
        errorMsg: 'Failed to go forward. Please try again.',
        showToast: false,
    },
    {
        name: 'handleHomeClick',
        fn: () => SessionService.saveAndExit(),
        errorMsg: 'Error exiting session:',
        onSuccess: (navigate) => () => navigate('/'),
    },
    {
        name: 'handleSaveAndExitClick',
        fn: async () => {
            const { sessionId, pastHistory } = useSessionStore.getState()
            const answers = pastHistory.map((item) => ({
                asset_index: item.assetIndex,
                tree_index: item.treeIndex,
                node_id: item.nodeId,
                answer: item.answer,
            }))

            await ExportService.exportSessionAsJSON(sessionId, answers)
            await SessionService.saveAndExit()
        },
        errorMsg: 'Error saving and exiting:',
        onSuccess: (navigate) => () => navigate('/'),
    },
]

// Function to get the handler configurations, adding navigation callbacks where needed
export const getHandlerConfigs = (navigate) =>
    BASE_HANDLER_CONFIGS.map((cfg) => ({
        ...cfg,
        onSuccess: cfg.onSuccess ? cfg.onSuccess(navigate) : undefined,
    }))


