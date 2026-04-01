import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Guard from '@presentation/routing/Guard'

const mockedUseRouteGuardAccess = vi.fn()

vi.mock('@application/hooks/useRouteGuardAccess', () => ({
    useRouteGuardAccess: (routeConfig) => mockedUseRouteGuardAccess(routeConfig),
}))

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
    beforeEach(() => {
        mockedUseRouteGuardAccess.mockReset()
    })

    it('show the child content if the route is not protected', () => {
        mockedUseRouteGuardAccess.mockReturnValue(true)
        renderGuard({ isProtected: false })
        expect(screen.getByText('Protected content')).toBeInTheDocument()
    })
})

// Tests for protected routes
describe('Guard — protected routes', () => {
    beforeEach(() => {
        mockedUseRouteGuardAccess.mockReset()
    })

    it('redirects to home if the route is protected and there is no data', () => {
        mockedUseRouteGuardAccess.mockReturnValue(false)
        renderGuard({ isProtected: true })
        // Guard redirects to "/" → the Home component is rendered
        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('shows protected content when access is granted', () => {
        mockedUseRouteGuardAccess.mockReturnValue(true)
        renderGuard({ isProtected: true }, <div>Restricted Area</div>)
        expect(screen.getByText('Restricted Area')).toBeInTheDocument()
    })
})
