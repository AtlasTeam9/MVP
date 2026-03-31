import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AssetFormView from '../AssetFormView'

const mocks = vi.hoisted(() => ({
    addAssetToDevice: vi.fn(),
}))

vi.mock('../../services/DeviceService', () => ({
    default: {
        addAssetToDevice: mocks.addAssetToDevice,
    },
}))

function renderAssetForm() {
    return render(
        <MemoryRouter initialEntries={['/asset/new']}>
            <Routes>
                <Route path="/asset/new" element={<AssetFormView />} />
                <Route path="/device/assets" element={<div>Device Assets</div>} />
            </Routes>
        </MemoryRouter>
    )
}

describe('AssetFormView', () => {
    beforeEach(() => {
        mocks.addAssetToDevice.mockReset()
    })

    it('renders form title and core fields', () => {
        renderAssetForm()

        expect(screen.getByText('Add New Asset')).toBeInTheDocument()
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/is sensitive/i)).toBeInTheDocument()
    })

    it('shows validation errors when submitting empty form', async () => {
        renderAssetForm()
        const user = userEvent.setup()

        await user.click(screen.getByText('Save'))

        await waitFor(() => {
            expect(screen.getByText('Name is required')).toBeInTheDocument()
            expect(screen.getByText('Type is required')).toBeInTheDocument()
        })
    })

    it('creates asset and navigates to device assets after valid save', async () => {
        renderAssetForm()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText(/name/i), 'Firewall Rules')
        await user.selectOptions(screen.getByLabelText(/type/i), 'Security Function')
        await user.click(screen.getByText('Save'))

        await waitFor(() => {
            expect(mocks.addAssetToDevice).toHaveBeenCalledTimes(1)
            expect(screen.getByText('Device Assets')).toBeInTheDocument()
        })

        const savedAsset = mocks.addAssetToDevice.mock.calls[0][0]
        expect(savedAsset.name).toBe('Firewall Rules')
        expect(savedAsset.type).toBe('Security Function')
        expect(savedAsset.isSensitive).toBe(false)
    })
})
