import { describe, expect, it } from 'vitest'

import * as helpers from '@application/services/sessionHelpers/index'

describe('sessionHelpers index exports', () => {
    it('re-exports all helper functions', () => {
        expect(typeof helpers.createDeviceFromApiResponse).toBe('function')
        expect(typeof helpers.mapResultsToRequirementResults).toBe('function')
        expect(typeof helpers.applyAnswerTransition).toBe('function')
        expect(typeof helpers.shouldUseGoBackFlow).toBe('function')
        expect(typeof helpers.postGoBackAnswer).toBe('function')
        expect(typeof helpers.postForwardAnswer).toBe('function')
        expect(typeof helpers.clearLocalSessionState).toBe('function')
        expect(typeof helpers.deleteRemoteSessionIfPresent).toBe('function')
    })
})
