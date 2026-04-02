import { describe, expect, it } from 'vitest'
import { filterResumableResults } from '@domain/treeRules'

describe('treeRules', () => {
    it('filterResumableResults returns safe empty list for invalid inputs', () => {
        expect(filterResumableResults(null, null)).toEqual([])
        expect(filterResumableResults({}, {})).toEqual([])
    })

    it('filterResumableResults excludes malformed result items', () => {
        const trees = [
            { id: 'R1', dependencies: [] },
            { id: 'R2', dependencies: ['R1'] },
        ]
        const results = [
            null,
            'invalid',
            { code: 'R1', status: 'NOT_COMPLETED' },
            { code: 'R2', status: 'PASS' },
        ]

        expect(filterResumableResults(results, trees)).toEqual([
            { code: 'R1', status: 'NOT_COMPLETED' },
            { code: 'R2', status: 'PASS' },
        ])
    })
})
