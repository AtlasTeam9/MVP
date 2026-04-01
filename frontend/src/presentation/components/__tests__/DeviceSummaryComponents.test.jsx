/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AssetInfo } from '@presentation/components/deviceSummary/AssetInfo'
import { DeviceInfo } from '@presentation/components/deviceSummary/DeviceInfo'
import { AssetInfoOverlay } from '@presentation/components/deviceSummary/AssetInfoOverlay'
import { DeviceInfoOverlay } from '@presentation/components/deviceSummary/DeviceInfoOverlay'
import { AssetItemView } from '@presentation/components/deviceSummary/AssetItemView'
import { AssetListView } from '@presentation/components/deviceSummary/AssetListView'
import { DeviceSelector } from '@presentation/components/deviceSummary/DeviceSelector'
import { DeviceMainActions } from '@presentation/components/deviceSummary/DeviceMainActions'
import { DeviceNavigationIcons } from '@presentation/components/deviceSummary/DeviceNavigationIcons'

const asset = {
    id: 'a1',
    name: 'Firewall',
    type: 'Security Function',
    isSensitive: true,
    description: 'Main rule set',
}

const device = {
    name: 'Router',
    operatingSystem: 'Linux',
    firmwareVersion: '1.0.0',
    functionalities: 'Routing',
    description: 'Edge device',
    assets: [asset],
}

describe('Device summary components', () => {
    // Tipo: test di integrazione (render combinato componenti)
    it('renders AssetInfo and DeviceInfo details', () => {
        render(
            <>
                <AssetInfo asset={asset} />
                <DeviceInfo device={device} />
            </>
        )

        expect(screen.getByText('Firewall')).toBeInTheDocument()
        expect(screen.getByText('Yes')).toBeInTheDocument()
        expect(screen.getByText('Router')).toBeInTheDocument()
        expect(screen.getByText('Linux')).toBeInTheDocument()
    })

    // Tipo: test di integrazione (modal + callback di chiusura)
    it('renders overlays and closes via close button', async () => {
        const user = userEvent.setup()
        const onCloseAsset = vi.fn()
        const onCloseDevice = vi.fn()

        render(
            <>
                <AssetInfoOverlay asset={asset} onClose={onCloseAsset} />
                <DeviceInfoOverlay device={device} onClose={onCloseDevice} />
            </>
        )

        const closeButtons = screen.getAllByRole('button', { name: /close dialog/i })
        await user.click(closeButtons[0])
        await user.click(closeButtons[1])

        expect(onCloseAsset).toHaveBeenCalledTimes(1)
        expect(onCloseDevice).toHaveBeenCalledTimes(1)
    })

    // Tipo: test di integrazione (interazioni utente su item)
    it('AssetItemView opens overlay and supports delete action', async () => {
        const user = userEvent.setup()
        const onDelete = vi.fn()

        render(<AssetItemView asset={asset} showDeleteIcon onDelete={onDelete} />)

        await user.click(screen.getByText('Firewall'))
        expect(screen.getByText('Asset details')).toBeInTheDocument()

        await user.click(screen.getByTitle('Delete asset'))
        expect(onDelete).toHaveBeenCalledWith('a1')
    })

    // Tipo: test di integrazione (dropdown e lista asset)
    it('AssetListView and DeviceSelector render asset list', async () => {
        const user = userEvent.setup()

        render(
            <>
                <AssetListView assets={device.assets} />
                <DeviceSelector device={device} />
            </>
        )

        expect(screen.getAllByText(/assets \(1\)/i).length).toBeGreaterThan(0)

        await user.click(screen.getByRole('button', { name: /router/i }))
        expect(screen.getAllByText('Security Function').length).toBeGreaterThan(0)
    })

    // Tipo: test di integrazione (navigazione + callback home)
    it('DeviceMainActions navigates to session test and DeviceNavigationIcons triggers home', async () => {
        const user = userEvent.setup()
        const onHome = vi.fn()

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <DeviceMainActions device={device} />
                                <DeviceNavigationIcons onHome={onHome} />
                            </>
                        }
                    />
                    <Route path="/session/test" element={<div>Session test page</div>} />
                </Routes>
            </MemoryRouter>
        )

        await user.click(screen.getByRole('button', { name: /return to homepage/i }))
        expect(onHome).toHaveBeenCalledTimes(1)

        await user.click(screen.getByRole('button', { name: /start test/i }))
        expect(screen.getByText('Session test page')).toBeInTheDocument()
    })
})
