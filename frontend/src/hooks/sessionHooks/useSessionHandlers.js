import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAsyncHandler, getHandlerConfigs } from './sessionHandlersConfig'
import useUIStore from '../../store/UIStore'

// Custom hook to create session handlers for Yes/No clicks and navigation,
// managing loading and error states
export function useSessionHandlers() {
    const navigate = useNavigate()
    const isLoading = useUIStore((state) => state.isSessionActionLoading)
    const setSessionActionLoading = useUIStore((state) => state.setSessionActionLoading)
    const setSaving = useUIStore((state) => state.setSaving)
    const [error, setError] = useState(null)
    const configs = useMemo(() => getHandlerConfigs(navigate), [navigate])
    const actionHandlers = useMemo(
        () =>
            configs.reduce((handlers, cfg) => {
                handlers[cfg.name] = createAsyncHandler(
                    setSessionActionLoading,
                    setSaving,
                    setError,
                    cfg.fn,
                    cfg.errorMsg,
                    cfg.isSavingAction,
                    cfg.onSuccess,
                    cfg.showToast
                )
                return handlers
            }, {}),
        [configs, setSessionActionLoading, setSaving]
    )

    return {
        ...actionHandlers,
        isLoading,
        error,
    }
}
