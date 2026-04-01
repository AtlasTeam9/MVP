import { describe, expect, it } from 'vitest'
import { buildDependenciesByRequirement, filterResumableResults } from '@shared/utils/treeUtils'

describe('treeUtils', () => {
    it('buildDependenciesByRequirement returns empty object for invalid trees payload', () => {
        expect(buildDependenciesByRequirement(null)).toEqual({})
        expect(buildDependenciesByRequirement({})).toEqual({})
        expect(buildDependenciesByRequirement('invalid')).toEqual({})
    })

    it('buildDependenciesByRequirement ignores malformed tree entries', () => {
        const dependencies = buildDependenciesByRequirement([
            null,
            { id: 'R1', dependencies: ['R0'] },
            { 'requirement_id': 'R2', dependencies: 'invalid' },
            { dependencies: ['R1'] },
        ])

        expect(dependencies).toEqual({
            R1: ['R0'],
            R2: [],
        })
    })

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
