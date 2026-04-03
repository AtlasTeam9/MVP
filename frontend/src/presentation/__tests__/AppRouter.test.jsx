import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppRouter from '@presentation/AppRouter'

const mocks = vi.hoisted(() => ({
    beforeUnload: vi.fn(),
    treeBootstrap: vi.fn(),
}))

vi.mock('@application/hooks/useBeforeUnload', () => ({
    useBeforeUnload: () => mocks.beforeUnload(),
}))

vi.mock('@application/hooks/useTreeBootstrap', () => ({
    useTreeBootstrap: () => mocks.treeBootstrap(),
}))

vi.mock('../routing/Guard', () => ({
    default: ({ children }) => <>{children}</>,
}))

vi.mock('../pages/HomeView', () => ({
    default: () => <div>Home mock</div>,
}))
vi.mock('../pages/DeviceFormView', () => ({
    default: () => <div>Device form mock</div>,
}))
vi.mock('../pages/DeviceAssetManagementView', () => ({
    default: () => <div>Device assets mock</div>,
}))
vi.mock('../pages/AssetFormView', () => ({
    default: () => <div>Asset form mock</div>,
}))
vi.mock('../pages/DeviceSummaryView', () => ({
    default: () => <div>Device summary mock</div>,
}))
vi.mock('../pages/SessionRunnerView', () => ({
    default: () => <div>Session runner mock</div>,
}))
vi.mock('../pages/ResultView', () => ({
    default: () => <div>Results mock</div>,
}))
vi.mock('../pages/ModifySessionView', () => ({
    default: () => <div>Modify session mock</div>,
}))

describe('AppRouter', () => {
    beforeEach(() => {
        mocks.beforeUnload.mockReset()
        mocks.treeBootstrap.mockReset()
    })

    it('calls bootstrap hooks and renders home route by default', () => {
        window.history.pushState({}, '', '/')

        render(<AppRouter />)

        expect(mocks.beforeUnload).toHaveBeenCalledOnce()
        expect(mocks.treeBootstrap).toHaveBeenCalledOnce()
        expect(screen.getByText('Home mock')).toBeInTheDocument()
    })

    it('renders modify session route when location matches', () => {
        window.history.pushState({}, '', '/session/modify')

        render(<AppRouter />)

        expect(screen.getByText('Modify session mock')).toBeInTheDocument()
    })
})
