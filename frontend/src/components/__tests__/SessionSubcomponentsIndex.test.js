import { describe, it, expect } from 'vitest'
import * as subs from '../sessionRunner/subcomponents'

describe('sessionRunner subcomponents index', () => {
    // Tipo: test di unità (contratto di re-export del modulo)
    it('re-exports expected members', () => {
        expect(typeof subs.SessionHeader).toBe('function')
        expect(typeof subs.QuestionDisplay).toBe('function')
        expect(typeof subs.AnswerButtons).toBe('function')
        expect(typeof subs.QuestionSection).toBe('function')
        expect(typeof subs.NavigationFooter).toBe('function')
        expect(typeof subs.NavButton).toBe('function')
    })
})
