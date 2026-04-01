import { createContext, createElement, useContext } from 'react'

const SessionRunnerContext = createContext(null)

function SessionRunnerProvider({ value, children }) {
    return createElement(SessionRunnerContext.Provider, { value }, children)
}

function useSessionRunnerContext() {
    return useContext(SessionRunnerContext)
}

export { SessionRunnerProvider, useSessionRunnerContext }
