import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DeviceFormView from '../DeviceFormView'

// Support function to render the DeviceFormView component within a router context for testing
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

// Integration tests for DeviceFormView covering rendering logic
describe('DeviceFormView — rendering', () => {
    it('shows the correct form title', () => {
        renderForm()
        expect(screen.getByText('Create a new Device')).toBeInTheDocument()
    })

    it('shows all required fields', () => {
        renderForm()
        expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/os/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/firmware/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/functionality/i)).toBeInTheDocument()
    })

    it('shows the optional Description field', () => {
        renderForm()
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('shows the Cancel, Reset and Save buttons', () => {
        renderForm()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Reset')).toBeInTheDocument()
        expect(screen.getByText('Save')).toBeInTheDocument()
    })
})

// Integration tests for DeviceFormView covering validation logic
describe('DeviceFormView — validation', () => {
    it('shows validation errors if the form is submitted empty', async () => {
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

    it('does not show errors with valid data', async () => {
        renderForm()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText(/nome/i), 'Router')
        await user.type(screen.getByLabelText(/os/i), 'Linux')
        await user.type(screen.getByLabelText(/firmware/i), '1.0.0')
        await user.type(screen.getByLabelText(/functionality/i), 'routing')
        await user.click(screen.getByText('Save'))

        await waitFor(() => {
            expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
            expect(screen.queryByText('OS is required')).not.toBeInTheDocument()
            expect(screen.queryByText('Firmware is required')).not.toBeInTheDocument()
            expect(screen.queryByText('Functionality is required')).not.toBeInTheDocument()
        })
    })
})

// Integration tests for DeviceFormView covering action logic
describe('DeviceFormView — actions', () => {
    it('navigates to the home page when clicking Cancel', async () => {
        renderForm()
        const user = userEvent.setup()
        await user.click(screen.getByText('Cancel'))
        expect(screen.getByText('Home')).toBeInTheDocument()
    })

    it('resets the fields when clicking Reset', async () => {
        renderForm()
        const user = userEvent.setup()
        const nameInput = screen.getByLabelText(/nome/i)

        await user.type(nameInput, 'Router')
        expect(nameInput).toHaveValue('Router')

        await user.click(screen.getByText('Reset'))
        expect(nameInput).toHaveValue('')
    })

    // TODO: modificare e verificare che si vada alla pagina corretta dopo il salvataggio
    it('navigates to the home page after a valid save', async () => {
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
