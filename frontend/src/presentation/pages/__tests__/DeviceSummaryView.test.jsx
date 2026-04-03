import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeviceSummaryView from '@presentation/pages/DeviceSummaryView'

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    location: { state: {} },
    currentDevice: { id: 'd1', name: 'Router A', assets: [] },
    clearDevice: vi.fn(),
    clearSession: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useLocation: () => mocks.location,
        useNavigate: () => mocks.navigate,
    }
})

vi.mock('../../../application/hooks/useCurrentDevice', () => ({
    useCurrentDevice: () => mocks.currentDevice,
}))

vi.mock('../../../application/services/DeviceService', () => ({
    default: {
        clearDevice: mocks.clearDevice,
    },
}))

vi.mock('../../../application/services/SessionService', () => ({
    default: {
        clearSession: mocks.clearSession,
    },
}))

vi.mock('../../components/common/BackIcon', () => ({
    default: ({ onBack }) => (
        <button type="button" onClick={onBack}>
            Back
        </button>
    ),
}))

vi.mock('../../components/deviceSummary/DeviceSelector', () => ({
    DeviceSelector: ({ device }) => <div>Selector for {device.name}</div>,
}))

vi.mock('../../components/deviceSummary/DeviceMainActions', () => ({
    DeviceMainActions: () => <div>Main actions</div>,
}))

vi.mock('../../components/deviceSummary/DeviceNavigationIcons', () => ({
    DeviceNavigationIcons: ({ onHome }) => (
        <button type="button" onClick={onHome}>
            Home
        </button>
    ),
}))

describe('DeviceSummaryView', () => {
    beforeEach(() => {
        mocks.navigate.mockReset()
        mocks.clearDevice.mockReset()
        mocks.clearSession.mockReset()
        mocks.clearSession.mockResolvedValue(undefined)
        mocks.location = { state: {} }
        mocks.currentDevice = { id: 'd1', name: 'Router A', assets: [] }
    })

    it('shows fallback when current device is missing', () => {
        mocks.currentDevice = null

        render(<DeviceSummaryView />)

        expect(screen.getByText('No device loaded')).toBeInTheDocument()
    })

    it('renders summary content and back button when coming from asset management', async () => {
        mocks.location = { state: { fromDeviceAssetManagement: true } }

        render(<DeviceSummaryView />)
        const user = userEvent.setup()

        expect(screen.getByText('Device Summary')).toBeInTheDocument()
        expect(screen.getByText('Selector for Router A')).toBeInTheDocument()
        expect(screen.getByText('Main actions')).toBeInTheDocument()

        await user.click(screen.getByText('Back'))

        await waitFor(() => {
            expect(mocks.clearSession).toHaveBeenCalledTimes(1)
            expect(mocks.navigate).toHaveBeenCalledWith('/device/assets')
        })
    })

    it('clears device/session and navigates home when home action is clicked', async () => {
        render(<DeviceSummaryView />)
        const user = userEvent.setup()

        await user.click(screen.getByText('Home'))

        await waitFor(() => {
            expect(mocks.clearDevice).toHaveBeenCalledTimes(1)
            expect(mocks.clearSession).toHaveBeenCalledTimes(1)
            expect(mocks.navigate).toHaveBeenCalledWith('/')
        })
    })
})


