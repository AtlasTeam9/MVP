import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import SessionRunnerView from '../SessionRunnerView'

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    currentDevice: { id: 'd1', name: 'Router A', assets: [{ id: 'a1', name: 'Asset A' }] },
    sessionState: {
        sessionId: 'session-1',
        isTestFinished: false,
    },
    handlers: {
        handleYesClick: vi.fn(),
    },
    useSessionRedirect: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => mocks.navigate,
    }
})

vi.mock('../../services/DeviceService', () => ({
    useCurrentDevice: () => mocks.currentDevice,
}))

vi.mock('../../hooks/sessionHooks/useSessionState', () => ({
    useSessionState: () => mocks.sessionState,
}))

vi.mock('../../hooks/sessionHooks/useSessionRedirect', () => ({
    useSessionRedirect: (...args) => mocks.useSessionRedirect(...args),
}))

vi.mock('../../hooks/sessionHooks/useSessionHandlers', () => ({
    useSessionHandlers: () => mocks.handlers,
}))

vi.mock('../../components/sessionRunner/SessionContentAdapter', () => ({
    SessionContentAdapter: ({ currentDevice, state }) => (
        <div>
            Adapter: {currentDevice?.name} / {state.sessionId}
        </div>
    ),
}))

describe('SessionRunnerView', () => {
    beforeEach(() => {
        mocks.navigate.mockReset()
        mocks.useSessionRedirect.mockReset()
        mocks.currentDevice = { id: 'd1', name: 'Router A', assets: [{ id: 'a1', name: 'Asset A' }] }
        mocks.sessionState = {
            sessionId: 'session-1',
            isTestFinished: false,
        }
    })

    it('renders adapter and wires redirect hook with state/device', () => {
        render(<SessionRunnerView />)

        expect(screen.getByText('Adapter: Router A / session-1')).toBeInTheDocument()
        expect(mocks.useSessionRedirect).toHaveBeenCalledWith('session-1', mocks.currentDevice)
    })

    it('navigates to results when the test is finished', async () => {
        mocks.sessionState = {
            sessionId: 'session-1',
            isTestFinished: true,
        }

        render(<SessionRunnerView />)

        await waitFor(() => {
            expect(mocks.navigate).toHaveBeenCalledWith('/results')
        })
    })
})
