import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Guard from './components/common/Guard'
import HomeView from './pages/HomeView'
import DeviceFormView from './pages/DeviceFormView'
import DeviceAssetManagementView from './pages/DeviceAssetManagementView'
import AssetFormView from './pages/AssetFormView'
import DeviceSummaryView from './pages/DeviceSummaryView'
import SessionRunnerView from './pages/SessionRunnerView'
import styles from './AppRouter.module.css'

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
    const routes = [
        { path: '/', view: <HomeView />, isProtected: false },
        { path: '/device/new', view: <DeviceFormView />, isProtected: false },
        { path: '/device/assets', view: <DeviceAssetManagementView />, isProtected: true },
        { path: '/asset/new', view: <AssetFormView />, isProtected: true },
        { path: '/device/summary', view: <DeviceSummaryView />, isProtected: true },
        { path: '/session/runner', view: <SessionRunnerView />, isProtected: true },
    ]

    return (
        <BrowserRouter>
            <div className={styles.waveLeft} aria-hidden="true" />
            <div className={styles.waveRight} aria-hidden="true" />
            <Routes>{routes.map(buildRoute)}</Routes>
        </BrowserRouter>
    )
}
