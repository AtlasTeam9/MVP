import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAsyncHandler, getHandlerConfigs } from './sessionHandlersConfig'

// Custom hook to create session handlers for Yes/No clicks and navigation,
// managing loading and error states
export function useSessionHandlers() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const configs = getHandlerConfigs(navigate)

    return configs.reduce(
        (handlers, cfg) => {
            handlers[cfg.name] = createAsyncHandler(
                setIsLoading,
                setError,
                cfg.fn,
                cfg.errorMsg,
                cfg.onSuccess
            )
            return handlers
        },
        { isLoading, error }
    )
}
