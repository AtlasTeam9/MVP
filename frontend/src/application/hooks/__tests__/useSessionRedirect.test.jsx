import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useSessionRedirect } from '@application/hooks/sessionHooks/useSessionRedirect'

function RedirectProbe({ sessionId, currentDevice }) {
    useSessionRedirect(sessionId, currentDevice)
    return <div>Session page</div>
}

describe('useSessionRedirect', () => {
    it('redirects to device summary when required state is missing', async () => {
        render(
            <MemoryRouter initialEntries={['/session/test']}>
                <Routes>
                    <Route
                        path="/session/test"
                        element={<RedirectProbe sessionId={null} currentDevice={null} />}
                    />
                    <Route path="/device/summary" element={<div>Device Summary</div>} />
                </Routes>
            </MemoryRouter>
        )

        expect(await screen.findByText('Device Summary')).toBeInTheDocument()
    })

    it('keeps user on current page when state is available', () => {
        render(
            <MemoryRouter initialEntries={['/session/test']}>
                <Routes>
                    <Route
                        path="/session/test"
                        element={
                            <RedirectProbe sessionId="session-1" currentDevice={{ id: 'd1' }} />
                        }
                    />
                    <Route path="/device/summary" element={<div>Device Summary</div>} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('Session page')).toBeInTheDocument()
        expect(screen.queryByText('Device Summary')).not.toBeInTheDocument()
    })
})
