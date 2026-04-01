import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Guard from '@presentation/routing/Guard'
import HomeView from '@presentation/pages/HomeView'
import DeviceFormView from '@presentation/pages/DeviceFormView'
import DeviceAssetManagementView from '@presentation/pages/DeviceAssetManagementView'
import AssetFormView from '@presentation/pages/AssetFormView'
import DeviceSummaryView from '@presentation/pages/DeviceSummaryView'
import SessionRunnerView from '@presentation/pages/SessionRunnerView'
import ResultView from '@presentation/pages/ResultView'
import ModifySessionView from '@presentation/pages/ModifySessionView'
import styles from '@presentation/AppRouter.module.css'
import { useBeforeUnload } from '@application/hooks/useBeforeUnload'
import { useTreeBootstrap } from '@application/hooks/useTreeBootstrap'

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
    useTreeBootstrap()

    return (
        <BrowserRouter>
            <div className={styles.waveLeft} aria-hidden="true" />
            <div className={styles.waveRight} aria-hidden="true" />
            <Routes>{ROUTES.map(buildRoute)}</Routes>
        </BrowserRouter>
    )
}
