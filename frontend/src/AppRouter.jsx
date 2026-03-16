import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeView from './pages/HomeView'

export default function AppRouter() {
    // --- Attributes ---
    const routes = [
        { path: '/', view: <HomeView />, isProtected: false },
        // Aggiungere altre rotte qui
    ]

    // --- Class methods ---

    // Method for guarding routes: check permissions before rendering the view
    const guardRoute = (routeConfig) => {
        if (routeConfig.isProtected) {
            // TODO: inserire logica per controllo permessi
            console.log(`Controllo permessi per la rotta: ${routeConfig.path}`)
            return true
        }
        return true
    }

    // Method to render the routes based on the configuration and guard
    const renderRoute = () => {
        return (
            <Routes>
                {routes.map((route, index) => {
                    const elementToRender = guardRoute(route) ? (
                        route.view
                    ) : (
                        <Navigate to="/" replace />
                    )

                    return <Route key={index} path={route.path} element={elementToRender} />
                })}
            </Routes>
        )
    }

    // --- Render method ---
    return <BrowserRouter>{renderRoute()}</BrowserRouter>
}
