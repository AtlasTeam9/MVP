import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SessionContentAdapter } from '../sessionRunner/SessionContentAdapter'
import { buildSessionContextValue } from '../sessionRunner/sessionContextValueBuilder'

const currentDeviceFixture = { id: 'd1', name: 'Router', assets: [{ id: 'a1' }] }
const stateFixture = {
    currentNode: { id: 'node1', text: 'Question?' },
    currentAssetIndex: 1,
    currentTreeIndex: 2,
    pastHistory: [{ nodeId: 'node0' }],
    futureHistory: [{ nodeId: 'node2' }],
}
const handlersFixture = {
    isLoading: true,
    error: 'boom',
    handleYesClick: vi.fn(),
    handleNoClick: vi.fn(),
    handleBackClick: vi.fn(),
    handleForwardClick: vi.fn(),
    handleHomeClick: vi.fn(),
    handleSaveAndExitClick: vi.fn(),
}

function createMappedInput(currentDevice, state, handlers, trees) {
    return {
        currentDevice,
        currentNode: state.currentNode,
        currentAssetIndex: state.currentAssetIndex,
        currentTreeIndex: state.currentTreeIndex,
        isLoading: handlers.isLoading,
        error: handlers.error,
        onYes: handlers.handleYesClick,
        onNo: handlers.handleNoClick,
        onBack: handlers.handleBackClick,
        onForward: handlers.handleForwardClick,
        onHome: handlers.handleHomeClick,
        onSaveExit: handlers.handleSaveAndExitClick,
        pastHistory: state.pastHistory,
        futureHistory: state.futureHistory,
        trees,
    }
}

vi.mock('../../store/TreeStore', () => ({
    default: (selector) =>
        selector({
            trees: [{ id: 'REQ1', title: 'Tree title', nodes: { node1: { question: 'Q' } } }],
        }),
}))

describe('SessionContentAdapter mapping', () => {
    it('maps state and handlers into a session context value', () => {
        const trees = [{ id: 'REQ1' }]

        const mapped = buildSessionContextValue(
            createMappedInput(currentDeviceFixture, stateFixture, handlersFixture, trees)
        )

        expect(mapped.currentDevice).toBe(currentDeviceFixture)
        expect(mapped.currentNode).toBe(stateFixture.currentNode)
        expect(mapped.currentAssetIndex).toBe(1)
        expect(mapped.currentTreeIndex).toBe(2)
        expect(mapped.isLoading).toBe(true)
        expect(mapped.error).toBe('boom')
        expect(mapped.onYes).toBe(handlersFixture.handleYesClick)
        expect(mapped.onNo).toBe(handlersFixture.handleNoClick)
        expect(mapped.onBack).toBe(handlersFixture.handleBackClick)
        expect(mapped.onForward).toBe(handlersFixture.handleForwardClick)
        expect(mapped.onHome).toBe(handlersFixture.handleHomeClick)
        expect(mapped.onSaveExit).toBe(handlersFixture.handleSaveAndExitClick)
        expect(mapped.pastHistory).toBe(stateFixture.pastHistory)
        expect(mapped.futureHistory).toBe(stateFixture.futureHistory)
        expect(mapped.trees).toBe(trees)
    })
})

describe('SessionContentAdapter integration', () => {
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
