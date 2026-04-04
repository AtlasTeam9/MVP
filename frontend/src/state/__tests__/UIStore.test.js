import { beforeEach, describe, expect, it } from 'vitest'
import useUIStore from '@state/UIStore'

describe('UIStore', () => {
    beforeEach(() => {
        useUIStore.getState().resetUIState()
    })

    it('updates UI flags', () => {
        useUIStore.getState().setSessionActionLoading(true)
        useUIStore.getState().setSaving(true)
        useUIStore.getState().setExporting(true)
        useUIStore.getState().setExportingSession(true)
        useUIStore.getState().setDirty(true)

        const state = useUIStore.getState()
        expect(state.isSessionActionLoading).toBe(true)
        expect(state.isSaving).toBe(true)
        expect(state.isExporting).toBe(true)
        expect(state.isExportingSession).toBe(true)
        expect(state.isDirty).toBe(true)
    })

    it('resets UI state', () => {
        useUIStore.getState().setDirty(true)
        useUIStore.getState().setExporting(true)
        useUIStore.getState().resetUIState()

        const state = useUIStore.getState()
        expect(state.isDirty).toBe(false)
        expect(state.isExporting).toBe(false)
    })
})
