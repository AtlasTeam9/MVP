import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Guard from '../Guard'

// Helper: set up Guard with a given route configuration and optional child content
function renderGuard(routeConfig, children = <div>Protected content</div>) {
    return render(
        // MemoryRouter simulate a browser environment for testing
        <MemoryRouter initialEntries={['/protected']}>
            <Routes>
                <Route path="/" element={<div>Home</div>} />
                <Route
                    path="/protected"
                    element={<Guard routeConfig={routeConfig}>{children}</Guard>}
                />
            </Routes>
        </MemoryRouter>
    )
}

// Test for non-protected routes
describe('Guard — non protected routes', () => {
    it('show the child content if the route is not protected', () => {
        renderGuard({ isProtected: false })
        expect(screen.getByText('Protected content')).toBeInTheDocument()
    })
})

// Tests for protected routes
describe('Guard — protected routes', () => {
    it('redirects to home if the route is protected and there is no data', () => {
        renderGuard({ isProtected: true })
        // Guard redirects to "/" → the Home component is rendered
        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    // NOTE: questo test andrà aggiornato quando Guard sarà completato
    // con la logica su currentDevice / activeSession
    it('does not show the protected content without authorization', () => {
        renderGuard({ isProtected: true }, <div>Restricted Area</div>)
        expect(screen.queryByText('Restricted area')).not.toBeInTheDocument()
    })
})
