import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetItemView } from '@presentation/components/deviceSummary/AssetItemView'

const asset = {
    id: 'asset-1',
    name: 'Firewall',
    type: 'Security Function',
    isSensitive: true,
    description: 'Main rules',
}

describe('AssetItemView', () => {
    it('opens details from keyboard with Enter and Space, but not with other keys', async () => {
        const user = userEvent.setup()
        render(<AssetItemView asset={asset} />)

        const trigger = screen.getByRole('button', { name: /open details for firewall/i })

        trigger.focus()
        await user.keyboard('{ArrowDown}')
        expect(screen.queryByText('Asset details')).not.toBeInTheDocument()

        await user.keyboard('{Enter}')
        expect(screen.getByText('Asset details')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /close dialog/i }))
        expect(screen.queryByText('Asset details')).not.toBeInTheDocument()

        trigger.focus()
        await user.keyboard(' ')
        expect(screen.getByText('Asset details')).toBeInTheDocument()
    })

    it('renders delete button only when enabled and calls onDelete with asset id', async () => {
        const user = userEvent.setup()
        const onDelete = vi.fn()

        const { rerender } = render(<AssetItemView asset={asset} onDelete={onDelete} />)
        expect(screen.queryByTitle('Delete asset')).not.toBeInTheDocument()

        rerender(<AssetItemView asset={asset} showDeleteIcon onDelete={onDelete} />)
        await user.click(screen.getByTitle('Delete asset'))

        expect(onDelete).toHaveBeenCalledTimes(1)
        expect(onDelete).toHaveBeenCalledWith('asset-1')
    })

    it('does not throw when delete icon is enabled without onDelete callback', async () => {
        const user = userEvent.setup()

        render(<AssetItemView asset={asset} showDeleteIcon />)
        await user.click(screen.getByTitle('Delete asset'))

        expect(screen.getByText('Firewall')).toBeInTheDocument()
    })
})
