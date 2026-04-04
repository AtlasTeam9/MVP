import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAsyncHandler, getHandlerConfigs } from '@application/hooks/sessionHooks/sessionHandlersConfig'
import useUIStore from '@state/UIStore'
import {
    selectIsSessionActionLoading,
    selectSetSessionActionLoading,
} from '@state/selectors/uiSelectors'

// Creates async session action handlers with shared loading, saving, and error orchestration.
export function useSessionHandlers() {
    const navigate = useNavigate()
    const isLoading = useUIStore(selectIsSessionActionLoading)
    const setSessionActionLoading = useUIStore(selectSetSessionActionLoading)
    const [error, setError] = useState(null)
    const configs = useMemo(() => getHandlerConfigs(navigate), [navigate])
    const actionHandlers = useMemo(
        () =>
            configs.reduce((handlers, cfg) => {
                handlers[cfg.name] = createAsyncHandler(
                    setSessionActionLoading,
                    setError,
                    cfg.fn,
                    cfg.errorMsg,
                    cfg.onSuccess,
                    cfg.showToast
                )
                return handlers
            }, {}),
        [configs, setSessionActionLoading]
    )

    return {
        ...actionHandlers,
        isLoading,
        error,
    }
}

