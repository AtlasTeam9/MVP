import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import HomeIcon from '@presentation/components/common/HomeIcon'

describe('HomeIcon', () => {
    // Integration test (UI + callback)
    it('calls custom onHome handler when provided', async () => {
        const onHome = vi.fn()
        const user = userEvent.setup()

        render(
            <MemoryRouter>
                <HomeIcon onHome={onHome} />
            </MemoryRouter>
        )

        await user.click(screen.getByRole('button', { name: /return to homepage/i }))

        expect(onHome).toHaveBeenCalledTimes(1)
    })

    // Integration test (UI + routing)
    it('navigates to home when no handler is provided', async () => {
        const user = userEvent.setup()

        render(
            <MemoryRouter initialEntries={['/current']}>
                <Routes>
                    <Route path="/" element={<div>Home page</div>} />
                    <Route path="/current" element={<HomeIcon />} />
                </Routes>
            </MemoryRouter>
        )

        await user.click(screen.getByRole('button', { name: /return to homepage/i }))

        await waitFor(() => {
            expect(screen.getByText('Home page')).toBeInTheDocument()
        })
    })
})
