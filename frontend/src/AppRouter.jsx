import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Guard from './components/common/Guard'
import HomeView from './pages/HomeView'
import DeviceFormView from './pages/DeviceFormView'
import DeviceAssetManagementView from './pages/DeviceAssetManagementView'
import AssetFormView from './pages/AssetFormView'
import DeviceSummaryView from './pages/DeviceSummaryView'
import SessionRunnerView from './pages/SessionRunnerView'
import ResultView from './pages/ResultView'
import ModifySessionView from './pages/ModifySessionView'
import TreeService from './services/TreeService'
import NotificationManager from './infrastructure/notifications/NotificationManager'
import styles from './AppRouter.module.css'
import { useBeforeUnload } from './hooks/useBeforeUnload'

// Route configuration
const ROUTES = [
    { path: '/', view: <HomeView />, isProtected: false },
    { path: '/device/new', view: <DeviceFormView />, isProtected: false },
    {
        path: '/device/assets',
        view: <DeviceAssetManagementView />,
        isProtected: true,
        requiresSessionId: false,
    },
    { path: '/asset/new', view: <AssetFormView />, isProtected: true, requiresSessionId: false },
    {
        path: '/device/summary',
        view: <DeviceSummaryView />,
        isProtected: true,
        requiresSessionId: true,
    },
    {
        path: '/session/test',
        view: <SessionRunnerView />,
        isProtected: true,
        requiresSessionId: true,
    },
    {
        path: '/results',
        view: <ResultView />,
        isProtected: true,
        requiresSessionId: true,
    },
    {
        path: '/session/modify',
        view: <ModifySessionView />,
        isProtected: true,
        requiresSessionId: true,
    },
]

// Function to build a Route element from a route configuration
const buildRoute = (route, index) => {
    return (
        <Route
            key={index}
            path={route.path}
            element={<Guard routeConfig={route}>{route.view}</Guard>}
        />
    )
}

// Main App Router component
export default function AppRouter() {
    useBeforeUnload()

    useEffect(() => {
        TreeService.loadTrees().catch((error) =>
            NotificationManager.notifyError(error, { id: 'LOAD_TREES_ERROR' })
        )
    }, [])

    return (
        <BrowserRouter>
            <div className={styles.waveLeft} aria-hidden="true" />
            <div className={styles.waveRight} aria-hidden="true" />
            <Routes>{ROUTES.map(buildRoute)}</Routes>
        </BrowserRouter>
    )
}
