import { createContext, createElement, useContext } from 'react'
import * as appServices from '@application/services/AppServices'

const defaultServices = {
    notificationService: appServices.notificationService,
}

const NotificationContext = createContext(null)

function NotificationProvider({ value, children }) {
    const services = value ? { ...defaultServices, ...value } : defaultServices
    return createElement(NotificationContext.Provider, { value: services }, children)
}

function useAppServices() {
    return useContext(NotificationContext) || defaultServices
}

export { NotificationProvider, useAppServices, defaultServices }