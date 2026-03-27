import SessionService from '../../services/SessionService'
import ExportService from '../../services/ExportService'
import useSessionStore from '../../store/SessionStore'

// Utility factory function to create an asynchronous handler for session actions
export const createAsyncHandler =
    (setIsLoading, setError, asyncFn, errorMsg, onSuccess) => async () => {
        try {
            setIsLoading(true)
            setError(null)
            await asyncFn()
            onSuccess?.()
        } catch (err) {
            setError(errorMsg)
            console.error(errorMsg, err)
            // TODO: Sistemare
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
            const sessionId = useSessionStore.getState().sessionId
            await ExportService.exportSessionAsJSON(sessionId)
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
