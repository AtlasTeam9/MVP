import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { NavigationFooter } from '../sessionRunner/subcomponents/NavigationFooter'
import { SessionRunnerProvider } from '../sessionRunner/SessionRunnerContext'

function renderNavigationFooter(contextValue) {
    return render(
        <MemoryRouter>
            <SessionRunnerProvider value={contextValue}>
                <NavigationFooter />
            </SessionRunnerProvider>
        </MemoryRouter>
    )
}

describe('NavigationFooter', () => {
    // Tipo: test di integrazione (interazioni UI + callback)
    it('triggers back, home and forward handlers', async () => {
        const onBack = vi.fn()
        const onHome = vi.fn()
        const onForward = vi.fn()
        const user = userEvent.setup()

        renderNavigationFooter({
            pastHistory: [{ nodeId: 'node1' }],
            futureHistory: [{ nodeId: 'node2' }],
            isLoading: false,
            onBack,
            onHome,
            onForward,
        })

        await user.click(screen.getByRole('button', { name: /previous question/i }))
        await user.click(screen.getByRole('button', { name: /return to homepage/i }))
        await user.click(screen.getByRole('button', { name: /next question/i }))

        expect(onBack).toHaveBeenCalledTimes(1)
        expect(onHome).toHaveBeenCalledTimes(1)
        expect(onForward).toHaveBeenCalledTimes(1)
    })

    // Tipo: test di integrazione (stato UI disabilitato)
    it('disables back and forward when history is empty', () => {
        renderNavigationFooter({
            pastHistory: [],
            futureHistory: [],
            isLoading: false,
            onBack: () => {},
            onHome: () => {},
            onForward: () => {},
        })

        expect(screen.getByRole('button', { name: /previous question/i })).toBeDisabled()
        expect(screen.getByRole('button', { name: /next question/i })).toBeDisabled()
        expect(screen.getByRole('button', { name: /return to homepage/i })).not.toBeDisabled()
    })
})
