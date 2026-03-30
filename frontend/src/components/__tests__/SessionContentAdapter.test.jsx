import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SessionContentAdapter } from '../sessionRunner/SessionContentAdapter'

vi.mock('../../store/TreeStore', () => ({
    default: (selector) =>
        selector({
            trees: [{ id: 'REQ1', title: 'Tree title', nodes: { node1: { question: 'Q' } } }],
        }),
}))

describe('SessionContentAdapter', () => {
    // Tipo: test di integrazione (adapter + store mockato)
    it('injects tree store data into SessionContent', () => {
        render(
            <MemoryRouter>
                <SessionContentAdapter
                    currentDevice={{ name: 'Router', assets: [{ id: 'a1', name: 'Firewall' }] }}
                    state={{
                        currentNode: { id: 'node1', text: 'Question?', description: null },
                        currentAssetIndex: 0,
                        currentTreeIndex: 0,
                        pastHistory: [{ nodeId: 'node1' }],
                        futureHistory: [],
                    }}
                    handlers={{
                        isLoading: false,
                        error: null,
                        handleYesClick: () => {},
                        handleNoClick: () => {},
                        handleBackClick: () => {},
                        handleForwardClick: () => {},
                        handleHomeClick: () => {},
                        handleSaveAndExitClick: () => {},
                    }}
                />
            </MemoryRouter>
        )

        expect(screen.getByText('Tree title')).toBeInTheDocument()
        expect(screen.getByText('Question?')).toBeInTheDocument()
    })
})
