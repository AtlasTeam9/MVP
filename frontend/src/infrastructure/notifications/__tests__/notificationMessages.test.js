import { describe, it, expect } from 'vitest'
import { getUserErrorMessage } from '@infrastructure/notifications/notificationMessages'

const mappedCases = [
    ['NETWORK_UNREACHABLE', 'Unable to reach the server. Please check your connection.'],
    ['HTTP_400', 'Invalid request. Please verify the provided data.'],
    ['HTTP_404', 'Resource not found.'],
    ['HTTP_422', 'The uploaded file is not valid.'],
    ['HTTP_500', 'Internal server error. Please try again later.'],
    ['TREE_NEXT_NODE_NOT_FOUND', 'Cannot continue: next node is unavailable.'],
    ['TREE_PREVIOUS_NODE_NOT_FOUND', 'Cannot go back: previous node is unavailable.'],
    ['TREE_FORWARD_NODE_NOT_FOUND', 'Cannot move forward: node is unavailable.'],
    ['TREE_FIRST_NODE_NOT_FOUND', 'Cannot start questionnaire: first node was not found.'],
    ['EXPORT_EMPTY_RESPONSE', 'Export failed: empty response from the server.'],
    ['EXPORT_DEVICE_REQUIRED', 'No device selected for export.'],
]

describe('getUserErrorMessage', () => {
    it.each(mappedCases)('returns mapped message for %s', (code, expectedMessage) => {
        expect(getUserErrorMessage({ code })).toBe(expectedMessage)
    })

    it('falls back to error message for unknown code', () => {
        expect(getUserErrorMessage({ code: 'UNKNOWN', message: 'Original message' })).toBe(
            'Original message'
        )
    })

    it('returns default message when error is missing', () => {
        expect(getUserErrorMessage(undefined)).toBe('Unexpected error.')
    })
})
