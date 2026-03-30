/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AnswerButtons } from '../sessionRunner/subcomponents/AnswerButtons'
import { QuestionDisplay } from '../sessionRunner/subcomponents/QuestionDisplay'
import { QuestionSection } from '../sessionRunner/subcomponents/QuestionSection'
import { SessionHeader } from '../sessionRunner/subcomponents/SessionHeader'
import { SessionContent } from '../sessionRunner/SessionContent'

describe('Session runner components', () => {
    // Tipo: test di integrazione (stato UI + callback pulsanti)
    it('AnswerButtons enable/disable and trigger callbacks', async () => {
        const user = userEvent.setup()
        const onYes = vi.fn()
        const onNo = vi.fn()

        const { rerender } = render(
            <AnswerButtons isLoading currentNode={null} onYes={onYes} onNo={onNo} />
        )

        expect(screen.getByRole('button', { name: 'YES' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'NO' })).toBeDisabled()

        rerender(<AnswerButtons isLoading={false} currentNode={{ id: 'n1' }} onYes={onYes} onNo={onNo} />)

        await user.click(screen.getByRole('button', { name: 'YES' }))
        await user.click(screen.getByRole('button', { name: 'NO' }))
        expect(onYes).toHaveBeenCalledTimes(1)
        expect(onNo).toHaveBeenCalledTimes(1)
    })

    // Tipo: test di integrazione (render condizionale contenuto)
    it('QuestionDisplay shows loading and node details', () => {
        const { rerender } = render(
            <QuestionDisplay currentNode={null} currentTreeIndex={0} trees={[]} />
        )
        expect(screen.getByText('Loading question...')).toBeInTheDocument()

        rerender(
            <QuestionDisplay
                currentNode={{ id: 'node1', text: 'Question?', description: 'Details' }}
                currentTreeIndex={0}
                trees={[{ title: 'Tree title' }]}
            />
        )

        expect(screen.getByText('Tree title')).toBeInTheDocument()
        expect(screen.getByText('Question?')).toBeInTheDocument()
        expect(screen.getByText('Details')).toBeInTheDocument()
    })

    // Tipo: test di integrazione (render sezione con errore)
    it('QuestionSection renders error and answer area', () => {
        render(
            <QuestionSection
                currentNode={{ id: 'n1', text: 'Question?' }}
                currentTreeIndex={0}
                trees={[{ title: 'Tree title' }]}
                error="Network error"
                isLoading={false}
                onYes={() => {}}
                onNo={() => {}}
            />
        )

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

        render(
            <SessionHeader
                currentDevice={currentDevice}
                currentAssetIndex={0}
                onSaveExit={onSaveExit}
                pastHistory={[{ assetIndex: 0, nodeId: 'node1' }]}
                trees={trees}
            />
        )

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
                    currentDevice={{ name: 'Router', assets: [{ id: 'a1', name: 'Firewall' }] }}
                    currentNode={{ id: 'node1', text: 'Question?', description: null }}
                    currentAssetIndex={0}
                    currentTreeIndex={0}
                    isLoading={false}
                    error={null}
                    pastHistory={[{ nodeId: 'node1' }]}
                    futureHistory={[{ nodeId: 'node2' }]}
                    trees={[{ title: 'Tree title', nodes: { node1: {} } }]}
                    {...handlers}
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
})
