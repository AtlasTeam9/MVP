import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeviceAssetManagementView from '../DeviceAssetManagementView'

function createHookData() {
    return {
        currentDevice: null,
        showUnsavedDialog: false,
        onAddAsset: vi.fn(),
        onGoToSummary: vi.fn(),
        onDeleteAsset: vi.fn(),
        onSaveDevice: vi.fn(),
        onConfirmSaveBeforeSummary: vi.fn(),
        onConfirmSkipSaveBeforeSummary: vi.fn(),
        onCancelUnsavedDialog: vi.fn(),
        onHome: vi.fn(),
    }
}

const mocks = vi.hoisted(() => ({
    hookData: createHookData(),
}))

vi.mock('../../hooks/useAssetManagement', () => ({
    useAssetManagement: () => mocks.hookData,
}))

vi.mock('../../components/common/BackIcon', () => ({
    default: ({ onBack }) => (
        <button onClick={onBack} type="button">
            Back
        </button>
    ),
}))

vi.mock('../../components/common/HomeIcon', () => ({
    default: ({ onHome }) => (
        <button onClick={onHome} type="button">
            Home
        </button>
    ),
}))

describe('DeviceAssetManagementView', () => {
    beforeEach(() => {
        mocks.hookData = createHookData()
    })

    it('shows fallback when no device is loaded', () => {
        render(<DeviceAssetManagementView />)

        expect(screen.getByText(/no device loaded/i)).toBeInTheDocument()
    })

    it('renders assets and triggers actions', async () => {
        mocks.hookData.currentDevice = {
            id: 'd1',
            name: 'Gateway',
            assets: [{ id: 'a1', name: 'Credential Store' }],
        }

        render(<DeviceAssetManagementView />)
        const user = userEvent.setup()

        expect(screen.getByText('Gateway')).toBeInTheDocument()
        expect(screen.getByText('Assets (1)')).toBeInTheDocument()

        await user.click(screen.getByText('Add new asset'))
        await user.click(screen.getByText('Go to summary'))
        await user.click(screen.getByText('Save Device'))
        await user.click(screen.getByLabelText('Delete asset Credential Store'))
        await user.click(screen.getByText('Home'))

        expect(mocks.hookData.onAddAsset).toHaveBeenCalledTimes(1)
        expect(mocks.hookData.onGoToSummary).toHaveBeenCalledTimes(1)
        expect(mocks.hookData.onSaveDevice).toHaveBeenCalledTimes(1)
        expect(mocks.hookData.onDeleteAsset).toHaveBeenCalledWith('a1')
        expect(mocks.hookData.onHome).toHaveBeenCalledTimes(1)
    })

    it('renders unsaved changes dialog and triggers dialog actions', async () => {
        mocks.hookData.currentDevice = {
            id: 'd1',
            name: 'Gateway',
            assets: [{ id: 'a1', name: 'Credential Store' }],
        }
        mocks.hookData.showUnsavedDialog = true

        render(<DeviceAssetManagementView />)
        const user = userEvent.setup()

        expect(screen.getByText('Unsaved changes')).toBeInTheDocument()

        await user.click(screen.getByText('YES'))
        await user.click(screen.getByText('NO'))
        await user.click(screen.getByLabelText('Close dialog'))

        expect(mocks.hookData.onConfirmSaveBeforeSummary).toHaveBeenCalledTimes(1)
        expect(mocks.hookData.onConfirmSkipSaveBeforeSummary).toHaveBeenCalledTimes(1)
        expect(mocks.hookData.onCancelUnsavedDialog).toHaveBeenCalledTimes(1)
    })
})
