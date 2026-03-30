import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadButton from '../common/UploadButton'

// Integration test for the UploadButton component
describe('UploadButton', () => {
    // Tipo: test di integrazione (render UI)
    it('shows the correct text', () => {
        render(<UploadButton onFileSelect={() => {}}>Upload JSON</UploadButton>)
        expect(screen.getByRole('button', { name: /upload json/i })).toBeInTheDocument()
    })

    // Tipo: test di integrazione (input file + callback)
    it('calls onFileSelect when a file is selected', async () => {
        const mockOnSelect = vi.fn()
        render(<UploadButton onFileSelect={mockOnSelect}>Upload</UploadButton>)

        const user = userEvent.setup()

        const file = new File(['{"id": 1}'], 'device.json', { type: 'application/json' })

        const input = screen.getByLabelText('Upload device file')

        await user.upload(input, file)

        expect(mockOnSelect).toHaveBeenCalledTimes(1)
        expect(mockOnSelect).toHaveBeenCalledWith(file)
    })

    // Tipo: test di integrazione (vincolo attributi input)
    it('accepts only files with .json extension', () => {
        render(<UploadButton onFileSelect={() => {}}>Upload</UploadButton>)
        const input = screen.getByLabelText('Upload device file')

        expect(input).toHaveAttribute('accept', '.json')
    })
})
