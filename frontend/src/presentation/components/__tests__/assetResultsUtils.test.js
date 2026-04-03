import { describe, it, expect } from 'vitest'
import {
    hasNotApplicableDependency,
    isAssetClickable,
    getAssetStatus,
    getAssetStatusClass,
} from '@presentation/components/results/assetResultsUtils'

describe('assetResultsUtils', () => {
    it('hasNotApplicableDependency handles missing data and detects NOT_APPLICABLE', () => {
        expect(hasNotApplicableDependency(undefined, ['D1'])).toBe(false)
        expect(hasNotApplicableDependency({ D1: 'PASS' }, undefined)).toBeUndefined()
        expect(hasNotApplicableDependency({ D1: 'PASS' }, ['D1'])).toBe(false)
        expect(hasNotApplicableDependency({ D1: 'NOT_APPLICABLE' }, ['D1'])).toBe(true)
    })

    it('isAssetClickable follows dependency and status rules', () => {
        expect(isAssetClickable('PASS', {}, undefined)).toBe(true)
        expect(isAssetClickable('PASS', {}, [])).toBe(true)
        expect(isAssetClickable('NOT_APPLICABLE', { D1: 'PASS' }, ['D1'])).toBe(false)
        expect(isAssetClickable('PASS', { D1: 'NOT_APPLICABLE' }, ['D1'])).toBe(false)
        expect(isAssetClickable('PASS', { D1: 'PASS' }, ['D1'])).toBe(true)
    })

    it('getAssetStatus returns requirement status or NOT_COMPLETED fallback', () => {
        const resultsPerAsset = {
            A1: { REQ1: 'PASS' },
        }

        expect(getAssetStatus('A1', 'REQ1', resultsPerAsset)).toBe('PASS')
        expect(getAssetStatus('A1', 'REQ2', resultsPerAsset)).toBe('NOT_COMPLETED')
        expect(getAssetStatus('A2', 'REQ1', resultsPerAsset)).toBe('NOT_COMPLETED')
        expect(getAssetStatus('A1', 'REQ1', undefined)).toBe('NOT_COMPLETED')
    })

    it('getAssetStatusClass maps all known statuses and unknown status fallback', () => {
        const styles = {
            statusPass: 'pass',
            statusFail: 'fail',
            statusNotApplicable: 'na',
            statusNotCompleted: 'nc',
        }

        expect(getAssetStatusClass('PASS', styles)).toBe('pass')
        expect(getAssetStatusClass('FAIL', styles)).toBe('fail')
        expect(getAssetStatusClass('NOT_APPLICABLE', styles)).toBe('na')
        expect(getAssetStatusClass('NOT_COMPLETED', styles)).toBe('nc')
        expect(getAssetStatusClass('UNKNOWN', styles)).toBe('')
    })
})
