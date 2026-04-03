import { describe, expect, it } from 'vitest'
import { buildDependenciesByRequirement } from '@shared/treeUtils'

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
})