import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import HomeView from '../HomeView'

function renderHome() {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/device/new" element={<div>Form dispositivo</div>} />
            </Routes>
        </MemoryRouter>
    )
}

describe('HomeView — rendering', () => {
    it('mostra il titolo corretto', () => {
        renderHome()
        expect(screen.getByText('EN-18031 Compliance Validation')).toBeInTheDocument()
    })

    it('mostra il sottotitolo descrittivo', () => {
        renderHome()
        expect(
            screen.getByText('Upload a session file or create a new one to get started.')
        ).toBeInTheDocument()
    })

    it('mostra i tre bottoni di azione', () => {
        renderHome()
        expect(screen.getByText('Carica Dispositivo (JSON)')).toBeInTheDocument()
        expect(screen.getByText('Crea Nuovo Dispositivo')).toBeInTheDocument()
        expect(screen.getByText('Carica Sessione Precedente')).toBeInTheDocument()
    })
})

describe('HomeView — navigazione', () => {
    it('naviga a /device/new al click su "Crea Nuovo Dispositivo"', async () => {
        renderHome()
        const user = userEvent.setup()
        await user.click(screen.getByText('Crea Nuovo Dispositivo'))
        expect(screen.getByText('Form dispositivo')).toBeInTheDocument()
    })
})
