/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultItemView } from '../results/ResultItemView'
import { ResultListView } from '../results/ResultListView'
import { AssetResultsView } from '../results/AssetResultsView'

describe('Results components', () => {
    // Tipo: test di integrazione (render + interazione item)
    it('ResultItemView renders fallback NOT_COMPLETED and handles expand click', async () => {
        const user = userEvent.setup()
        const onToggleExpand = vi.fn()

        render(
            <ResultItemView item={{ code: 'REQ-1', status: '' }} onToggleExpand={onToggleExpand} />
        )

        expect(screen.getByText('NOT_COMPLETED')).toBeInTheDocument()

        await user.click(screen.getByText('REQ-1'))
        expect(onToggleExpand).toHaveBeenCalledTimes(1)
    })

    // Tipo: test di integrazione (render lista componenti)
    it('ResultListView renders multiple result items', () => {
        const items = [
            { code: 'REQ-1', status: 'PASS' },
            { code: 'REQ-2', status: 'FAIL' },
        ]

        render(<ResultListView items={items} />)

        expect(screen.getByText('REQ-1')).toBeInTheDocument()
        expect(screen.getByText('REQ-2')).toBeInTheDocument()
    })

    // Tipo: test di integrazione (selezione asset + callback)
    it('AssetResultsView selects clickable asset and calls callback', async () => {
        const user = userEvent.setup()
        const onAssetSelect = vi.fn()
        const assets = [{ id: 'a1', name: 'Firewall' }]
        const resultsPerAsset = { a1: { REQ1: 'PASS', DEP1: 'PASS' } }

        render(
            <AssetResultsView
                assets={assets}
                requirementId="REQ1"
                resultsPerAsset={resultsPerAsset}
                dependencies={['DEP1']}
                onAssetSelect={onAssetSelect}
            />
        )

        await user.click(screen.getByText('Firewall'))
        expect(onAssetSelect).toHaveBeenCalledWith('a1')
    })

    // Tipo: test di integrazione (vincoli di dipendenza)
    it('AssetResultsView blocks click when dependencies are not applicable', async () => {
        const user = userEvent.setup()
        const onAssetSelect = vi.fn()
        const assets = [{ id: 'a1', name: 'Firewall' }]
        const resultsPerAsset = { a1: { REQ1: 'PASS', DEP1: 'NOT_APPLICABLE' } }

        render(
            <AssetResultsView
                assets={assets}
                requirementId="REQ1"
                resultsPerAsset={resultsPerAsset}
                dependencies={['DEP1']}
                onAssetSelect={onAssetSelect}
            />
        )

        await user.click(screen.getByText('Firewall'))
        expect(onAssetSelect).not.toHaveBeenCalled()
    })

    // Tipo: test di integrazione (fallback UI)
    it('AssetResultsView shows fallback when data is missing', () => {
        render(<AssetResultsView assets={null} requirementId="REQ1" resultsPerAsset={null} />)

        expect(screen.getByText('No assets available')).toBeInTheDocument()
    })
})
