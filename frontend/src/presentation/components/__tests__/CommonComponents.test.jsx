import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BackIcon from '@presentation/components/common/BackIcon'
import { Modal } from '@presentation/components/common/Modal'

describe('Common components', () => {
    // Integration test: verify that BackIcon navigates correctly when no onBack is provided
    it('BackIcon navigates to default route when no onBack is provided', async () => {
        const user = userEvent.setup()
        render(
            <MemoryRouter initialEntries={['/current']}>
                <Routes>
                    <Route path="/device/new" element={<div>Device form</div>} />
                    <Route path="/current" element={<BackIcon />} />
                </Routes>
            </MemoryRouter>
        )

        await user.click(screen.getByRole('button', { name: /go back/i }))
        expect(screen.getByText('Device form')).toBeInTheDocument()
    })

    // Integration test (UI + callback)
    it('BackIcon calls custom onBack handler when provided', async () => {
        const user = userEvent.setup()
        const onBack = vi.fn()
        render(
            <MemoryRouter>
                <BackIcon onBack={onBack} />
            </MemoryRouter>
        )

        await user.click(screen.getByRole('button', { name: /go back/i }))
        expect(onBack).toHaveBeenCalledTimes(1)
    })

    // Integration test (UI + keyboard events)
    it('Modal closes on overlay click and Escape key', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()
        const { container } = render(
            <Modal title="Test dialog" onClose={onClose}>
                <div>Dialog content</div>
            </Modal>
        )

        expect(screen.getByRole('dialog', { name: /test dialog/i })).toBeInTheDocument()

        await user.click(container.firstChild)
        fireEvent.keyDown(document, { key: 'Escape' })

        expect(onClose).toHaveBeenCalledTimes(2)
    })
})
