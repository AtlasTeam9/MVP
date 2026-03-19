import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import HomeView from '../HomeView'

// Support function to render the HomeView component within a router context for testing
function renderHome() {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/device/new" element={<div>Device form</div>} />
            </Routes>
        </MemoryRouter>
    )
}

// Integration tests for HomeView covering rendering logic
describe('HomeView — rendering', () => {
    it('shows the correct title', () => {
        renderHome()
        expect(screen.getByText('EN-18031 Compliance Verification')).toBeInTheDocument()
    })

    it('shows the descriptive subtitle', () => {
        renderHome()
        expect(
            screen.getByText('Upload a session file or create a new one to get started.')
        ).toBeInTheDocument()
    })

    it('shows the three action buttons', () => {
        renderHome()
        expect(screen.getByText('Upload Device (JSON)')).toBeInTheDocument()
        expect(screen.getByText('Create New Device')).toBeInTheDocument()
        expect(screen.getByText('Upload Previous Session')).toBeInTheDocument()
    })
})

// Integration tests for HomeView covering navigation logic
describe('HomeView — navigation', () => {
    it('navigates to /device/new when clicking "Create New Device"', async () => {
        renderHome()
        const user = userEvent.setup()
        await user.click(screen.getByText('Create New Device'))
        expect(screen.getByText('Device form')).toBeInTheDocument()
    })

    // TODO: aggiungere test per gli altri due bottoni quando implementata la logica di caricamento
})
