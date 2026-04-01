/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AnswerButtons } from '@presentation/components/sessionRunner/subcomponents/AnswerButtons'
import { QuestionDisplay } from '@presentation/components/sessionRunner/subcomponents/QuestionDisplay'
import { QuestionSection } from '@presentation/components/sessionRunner/subcomponents/QuestionSection'
import { SessionHeader } from '@presentation/components/sessionRunner/subcomponents/SessionHeader'
import { SessionContent } from '@presentation/components/sessionRunner/SessionContent'
import { SessionRunnerProvider } from '@presentation/components/sessionRunner/SessionRunnerContext'

function renderWithSessionRunnerContext(ui, value) {
    return render(<SessionRunnerProvider value={value}>{ui}</SessionRunnerProvider>)
}

describe('Session runner components', () => {
    // Tipo: test di integrazione (stato UI + callback pulsanti)
    it('AnswerButtons enable/disable and trigger callbacks', async () => {
        const user = userEvent.setup()
        const onYes = vi.fn()
        const onNo = vi.fn()
        const baseContextValue = {
            currentNode: null,
            isLoading: true,
            onYes,
            onNo,
        }

        const { rerender } = renderWithSessionRunnerContext(<AnswerButtons />, baseContextValue)

        expect(screen.getByRole('button', { name: 'YES' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'NO' })).toBeDisabled()

        rerender(
            <SessionRunnerProvider
                value={{ ...baseContextValue, isLoading: false, currentNode: { id: 'n1' } }}
            >
                <AnswerButtons />
            </SessionRunnerProvider>
        )

        await user.click(screen.getByRole('button', { name: 'YES' }))
        await user.click(screen.getByRole('button', { name: 'NO' }))
        expect(onYes).toHaveBeenCalledTimes(1)
        expect(onNo).toHaveBeenCalledTimes(1)
    })

    // Tipo: test di integrazione (render condizionale contenuto)
    it('QuestionDisplay shows loading and node details', () => {
        const baseContextValue = {
            currentNode: null,
            currentTreeIndex: 0,
            trees: [],
        }
        const { rerender } = renderWithSessionRunnerContext(<QuestionDisplay />, baseContextValue)

        expect(screen.getByText('Loading question...')).toBeInTheDocument()

        rerender(
            <SessionRunnerProvider
                value={{
                    ...baseContextValue,
                    currentNode: { id: 'node1', text: 'Question?', description: 'Details' },
                    trees: [{ title: 'Tree title' }],
                }}
            >
                <QuestionDisplay />
            </SessionRunnerProvider>
        )

        expect(screen.getByText('Tree title')).toBeInTheDocument()
        expect(screen.getByText('Question?')).toBeInTheDocument()
        expect(screen.getByText('Details')).toBeInTheDocument()
    })

    // Tipo: test di integrazione (render sezione con errore)
    it('QuestionSection renders error and answer area', () => {
        renderWithSessionRunnerContext(<QuestionSection />, {
            currentNode: { id: 'n1', text: 'Question?' },
            currentTreeIndex: 0,
            trees: [{ title: 'Tree title' }],
            error: 'Network error',
            isLoading: false,
            onYes: () => {},
            onNo: () => {},
        })

        expect(screen.getByText('Network error')).toBeInTheDocument()
        expect(screen.getByText('Question?')).toBeInTheDocument()
    })

    // Tipo: test di integrazione (calcolo visibile + callback uscita)
    it('SessionHeader computes percentage and calls save and exit', async () => {
        const user = userEvent.setup()
        const onSaveExit = vi.fn()
        const currentDevice = {
            name: 'Router',
            assets: [{ id: 'a1', name: 'Firewall' }],
        }
        const trees = [{ nodes: { node1: {}, node2: {} } }]

        renderWithSessionRunnerContext(<SessionHeader />, {
            currentDevice,
            currentAssetIndex: 0,
            currentTreeIndex: 0,
            onSaveExit,
            pastHistory: [{ assetIndex: 0, nodeId: 'node1' }],
            trees,
        })

        expect(screen.getByText('Router')).toBeInTheDocument()
        expect(screen.getByText(/asset:/i)).toBeInTheDocument()
        expect(screen.getByText(/%/i)).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /save & exit/i }))
        expect(onSaveExit).toHaveBeenCalledTimes(1)
    })

    // Tipo: test di integrazione (orchestrazione contenuto sessione)
    it('SessionContent renders and delegates interactions', async () => {
        const user = userEvent.setup()
        const handlers = {
            onYes: vi.fn(),
            onNo: vi.fn(),
            onBack: vi.fn(),
            onForward: vi.fn(),
            onHome: vi.fn(),
            onSaveExit: vi.fn(),
        }

        render(
            <MemoryRouter>
                <SessionContent
                    sessionContextValue={{
                        currentDevice: { name: 'Router', assets: [{ id: 'a1', name: 'Firewall' }] },
                        currentNode: { id: 'node1', text: 'Question?', description: null },
                        currentAssetIndex: 0,
                        currentTreeIndex: 0,
                        isLoading: false,
                        error: null,
                        pastHistory: [{ nodeId: 'node1' }],
                        futureHistory: [{ nodeId: 'node2' }],
                        trees: [{ title: 'Tree title', nodes: { node1: {} } }],
                        ...handlers,
                    }}
                />
            </MemoryRouter>
        )

        await user.click(screen.getByRole('button', { name: 'YES' }))
        await user.click(screen.getByRole('button', { name: 'NO' }))
        await user.click(screen.getByRole('button', { name: /previous question/i }))
        await user.click(screen.getByRole('button', { name: /next question/i }))
        await user.click(screen.getByRole('button', { name: /return to homepage/i }))

        expect(handlers.onYes).toHaveBeenCalledTimes(1)
        expect(handlers.onNo).toHaveBeenCalledTimes(1)
        expect(handlers.onBack).toHaveBeenCalledTimes(1)
        expect(handlers.onForward).toHaveBeenCalledTimes(1)
        expect(handlers.onHome).toHaveBeenCalledTimes(1)
    })

    it('SessionContent handles null context value safely', () => {
        render(
            <MemoryRouter>
                <SessionContent sessionContextValue={null} />
            </MemoryRouter>
        )

        expect(screen.getByText('Loading question...')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'YES' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'NO' })).toBeDisabled()
        expect(screen.getByRole('button', { name: /previous question/i })).toBeDisabled()
        expect(screen.getByRole('button', { name: /next question/i })).toBeDisabled()
    })
})
