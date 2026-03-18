import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DeviceFormView from '../DeviceFormView'

function renderForm() {
    return render(
        <MemoryRouter initialEntries={['/device/new']}>
            <Routes>
                <Route path="/" element={<div>Home</div>} />
                <Route path="/device/new" element={<DeviceFormView />} />
            </Routes>
        </MemoryRouter>
    )
}

describe('DeviceFormView — rendering', () => {
    it('mostra il titolo del form', () => {
        renderForm()
        expect(screen.getByText('Create a new Device')).toBeInTheDocument()
    })

    it('mostra tutti i campi obbligatori', () => {
        renderForm()
        expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/os/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/firmware/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/functionality/i)).toBeInTheDocument()
    })

    it('mostra il campo opzionale Description', () => {
        renderForm()
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('mostra i bottoni Cancel, Reset e Save', () => {
        renderForm()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Reset')).toBeInTheDocument()
        expect(screen.getByText('Save')).toBeInTheDocument()
    })
})

describe('DeviceFormView — validazione', () => {
    it('mostra errori di validazione se si invia il form vuoto', async () => {
        renderForm()
        const user = userEvent.setup()
        await user.click(screen.getByText('Save'))

        await waitFor(() => {
            expect(screen.getByText('Name is required')).toBeInTheDocument()
            expect(screen.getByText('OS is required')).toBeInTheDocument()
            expect(screen.getByText('Firmware is required')).toBeInTheDocument()
            expect(screen.getByText('Functionality is required')).toBeInTheDocument()
        })
    })

    it('non mostra errori con dati validi', async () => {
        renderForm()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText(/nome/i), 'Router')
        await user.type(screen.getByLabelText(/os/i), 'Linux')
        await user.type(screen.getByLabelText(/firmware/i), '1.0.0')
        await user.type(screen.getByLabelText(/functionality/i), 'routing')
        await user.click(screen.getByText('Save'))

        await waitFor(() => {
            expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
        })
    })
})

describe('DeviceFormView — azioni', () => {
    it('naviga alla home al click su Cancel', async () => {
        renderForm()
        const user = userEvent.setup()
        await user.click(screen.getByText('Cancel'))
        expect(screen.getByText('Home')).toBeInTheDocument()
    })

    it('resetta i campi al click su Reset', async () => {
        renderForm()
        const user = userEvent.setup()
        const nameInput = screen.getByLabelText(/nome/i)

        await user.type(nameInput, 'Router')
        expect(nameInput).toHaveValue('Router')

        await user.click(screen.getByText('Reset'))
        expect(nameInput).toHaveValue('')
    })

    it('naviga alla home dopo un salvataggio valido', async () => {
        renderForm()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText(/nome/i), 'Router')
        await user.type(screen.getByLabelText(/os/i), 'Linux')
        await user.type(screen.getByLabelText(/firmware/i), '1.0.0')
        await user.type(screen.getByLabelText(/functionality/i), 'routing')
        await user.click(screen.getByText('Save'))

        await waitFor(() => {
            expect(screen.getByText('Home')).toBeInTheDocument()
        })
    })
})
