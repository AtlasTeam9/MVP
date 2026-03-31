import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ResultActions } from '../results/ResultActions'

function renderActions(overrides = {}) {
    const props = {
        isTestFinished: false,
        isSessionUploaded: false,
        isExporting: false,
        isExportingSession: false,
        showFormatDialog: false,
        onResumeSession: vi.fn(),
        onModifySession: vi.fn(),
        onExportClick: vi.fn(),
        onExportSessionClick: vi.fn(),
        onFormatSelect: vi.fn(),
        onCloseDialog: vi.fn(),
        onHome: vi.fn(),
        ...overrides,
    }

    render(
        <MemoryRouter>
            <ResultActions {...props} />
        </MemoryRouter>
    )

    return props
}

describe('ResultActions', () => {
    // Tipo: test di integrazione (render condizionale UI)
    it('shows Resume Session button when test is not finished', () => {
        renderActions({ isTestFinished: false })
        expect(screen.getByRole('button', { name: /resume session/i })).toBeInTheDocument()
    })

    // Tipo: test di integrazione (render condizionale UI)
    it('shows Modify Session button only when test is finished and uploaded', () => {
        renderActions({ isTestFinished: true, isSessionUploaded: true })
        expect(screen.getByRole('button', { name: /modify session/i })).toBeInTheDocument()
    })

    // Tipo: test di integrazione (interazione UI + callback)
    it('calls onHome when home icon is clicked', async () => {
        const user = userEvent.setup()
        const props = renderActions()

        await user.click(screen.getByRole('button', { name: /return to homepage/i }))

        expect(props.onHome).toHaveBeenCalledTimes(1)
    })
})
