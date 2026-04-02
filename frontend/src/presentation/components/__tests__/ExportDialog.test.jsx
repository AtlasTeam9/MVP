import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportDialog } from '@presentation/components/results/ExportDialog'

describe('ExportDialog', () => {
    // Integration test (UI actions + format callback)
    it('calls onFormatSelect with selected format', async () => {
        const onFormatSelect = vi.fn()
        const onCancel = vi.fn()
        const user = userEvent.setup()

        render(<ExportDialog onFormatSelect={onFormatSelect} onCancel={onCancel} />)

        await user.click(screen.getByRole('button', { name: /export as csv/i }))
        expect(onFormatSelect).toHaveBeenCalledWith('csv')

        await user.click(screen.getByRole('button', { name: /export as pdf/i }))
        expect(onFormatSelect).toHaveBeenCalledWith('pdf')
    })

    // Integration test (UI action + close callback)
    it('calls onCancel when close button is clicked', async () => {
        const onFormatSelect = vi.fn()
        const onCancel = vi.fn()
        const user = userEvent.setup()

        render(<ExportDialog onFormatSelect={onFormatSelect} onCancel={onCancel} />)

        await user.click(screen.getByRole('button', { name: /close dialog/i }))

        expect(onCancel).toHaveBeenCalledTimes(1)
    })
})
