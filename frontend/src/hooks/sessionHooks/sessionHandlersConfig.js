/* eslint-disable camelcase */
import SessionService from '../../services/SessionService'
import ExportService from '../../services/ExportService'
import useSessionStore from '../../store/SessionStore'
import NotificationManager from '../../infrastructure/notifications/NotificationManager'

// Utility factory function to create an asynchronous handler for session actions
export const createAsyncHandler =
    (
        setIsLoading,
        setIsSaving,
        setError,
        asyncFn,
        errorMsg,
        isSavingAction,
        onSuccess
    ) =>
    async () => {
        try {
            setIsLoading(true)
            setIsSaving(Boolean(isSavingAction))
            setError(null)
            await asyncFn()
            onSuccess?.()
        } catch (err) {
            setError(errorMsg)
            NotificationManager.notifyError(err)
        } finally {
            setIsLoading(false)
            setIsSaving(false)
        }
    }

// Array of base configurations for session handlers,
// defining the function to call, error message, and optional success callback
const BASE_HANDLER_CONFIGS = [
    {
        name: 'handleYesClick',
        fn: () => SessionService.sendAnswer(true),
        errorMsg: 'Failed to submit answer. Please try again.',
    },
    {
        name: 'handleNoClick',
        fn: () => SessionService.sendAnswer(false),
        errorMsg: 'Failed to submit answer. Please try again.',
    },
    {
        name: 'handleBackClick',
        fn: () => SessionService.previousStep(),
        errorMsg: 'Failed to go back. Please try again.',
        label: '← Indietro',
    },
    {
        name: 'handleForwardClick',
        fn: () => SessionService.forwardStep(),
        errorMsg: 'Failed to go forward. Please try again.',
        label: 'Avanti →',
    },
    {
        name: 'handleHomeClick',
        fn: () => SessionService.saveAndExit(),
        errorMsg: 'Error exiting session:',
        label: '🏠',
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
        isSavingAction: true,
        onSuccess: (navigate) => () => navigate('/'),
    },
]

// Function to get the handler configurations, adding navigation callbacks where needed
export const getHandlerConfigs = (navigate) =>
    BASE_HANDLER_CONFIGS.map((cfg) => ({
        ...cfg,
        onSuccess: cfg.onSuccess ? cfg.onSuccess(navigate) : undefined,
    }))
