import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import HomeView from '@presentation/pages/HomeView'

const mocks = vi.hoisted(() => ({
    sessionService: {
        createSessionWithFile: vi.fn(),
        loadSessionFromFile: vi.fn(),
    },
    notifications: {
        notifyError: vi.fn(),
    },
}))

vi.mock('../../../application/services/SessionService', () => ({
    default: mocks.sessionService,
}))

vi.mock('@application/services/AppServices', () => ({
    notificationService: mocks.notifications,
}))

// Support function to render the HomeView component within a router context for testing
function renderHome() {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/device/new" element={<div>Device form</div>} />
                <Route path="/device/summary" element={<div>Device summary</div>} />
                <Route path="/results" element={<div>Results page</div>} />
            </Routes>
        </MemoryRouter>
    )
}

beforeEach(() => {
    mocks.sessionService.createSessionWithFile.mockReset()
    mocks.sessionService.loadSessionFromFile.mockReset()
    mocks.notifications.notifyError.mockReset()
})

// Integration tests for HomeView covering rendering logic
describe('HomeView — rendering', () => {
    it('shows the correct title', () => {
        renderHome()
        expect(screen.getByText('EN-18031 Compliance Verification')).toBeInTheDocument()
    })

    it('shows the descriptive subtitle', () => {
        renderHome()
        expect(
            screen.getByText('Upload a session file or create a new one to get started.')
        ).toBeInTheDocument()
    })

    it('shows the three action buttons', () => {
        renderHome()
        expect(screen.getByText('Upload Device (JSON)')).toBeInTheDocument()
        expect(screen.getByText('Create New Device')).toBeInTheDocument()
        expect(screen.getByText('Upload Previous Session')).toBeInTheDocument()
    })
})

// Integration tests for HomeView covering navigation logic
describe('HomeView — navigation success paths', () => {
    it('navigates to /device/new when clicking "Create New Device"', async () => {
        renderHome()
        const user = userEvent.setup()
        await user.click(screen.getByText('Create New Device'))
        expect(screen.getByText('Device form')).toBeInTheDocument()
    })

    it('loads device JSON and navigates to /device/summary', async () => {
        const user = userEvent.setup()
        const file = new File(['{}'], 'device.json', { type: 'application/json' })
        mocks.sessionService.createSessionWithFile.mockResolvedValue(undefined)

        renderHome()

        const uploadInputs = screen.getAllByLabelText('Upload device file')
        await user.upload(uploadInputs[0], file)

        expect(mocks.sessionService.createSessionWithFile).toHaveBeenCalledWith(file)
        expect(await screen.findByText('Device summary')).toBeInTheDocument()
    })

    it('loads previous session JSON and navigates to /results', async () => {
        const user = userEvent.setup()
        const file = new File(['{}'], 'session.json', { type: 'application/json' })
        mocks.sessionService.loadSessionFromFile.mockResolvedValue(undefined)

        renderHome()

        const uploadInputs = screen.getAllByLabelText('Upload device file')
        await user.upload(uploadInputs[1], file)

        expect(mocks.sessionService.loadSessionFromFile).toHaveBeenCalledWith(file)
        expect(await screen.findByText('Results page')).toBeInTheDocument()
    })
})

describe('HomeView — navigation error paths', () => {
    it('shows notification when device upload fails', async () => {
        const user = userEvent.setup()
        const file = new File(['{}'], 'device.json', { type: 'application/json' })
        const error = new Error('device upload failed')
        mocks.sessionService.createSessionWithFile.mockRejectedValue(error)

        renderHome()

        const uploadInputs = screen.getAllByLabelText('Upload device file')
        await user.upload(uploadInputs[0], file)

        expect(mocks.sessionService.createSessionWithFile).toHaveBeenCalledWith(file)
        expect(mocks.notifications.notifyError).toHaveBeenCalledWith(error)
        expect(screen.queryByText('Device summary')).not.toBeInTheDocument()
    })

    it('shows notification when previous session upload fails', async () => {
        const user = userEvent.setup()
        const file = new File(['{}'], 'session.json', { type: 'application/json' })
        const error = new Error('session upload failed')
        mocks.sessionService.loadSessionFromFile.mockRejectedValue(error)

        renderHome()

        const uploadInputs = screen.getAllByLabelText('Upload device file')
        await user.upload(uploadInputs[1], file)

        expect(mocks.sessionService.loadSessionFromFile).toHaveBeenCalledWith(file)
        expect(mocks.notifications.notifyError).toHaveBeenCalledWith(error)
        expect(screen.queryByText('Results page')).not.toBeInTheDocument()
    })
})



