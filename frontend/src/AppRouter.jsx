import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Guard from './components/Guard'
import HomeView from './pages/HomeView'
import DeviceFormView from './pages/DeviceFormView'

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
    ]

    return (
        <BrowserRouter>
            <Routes>{routes.map(buildRoute)}</Routes>
        </BrowserRouter>
    )
}
