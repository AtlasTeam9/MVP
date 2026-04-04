import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const initialState = {
    isSessionActionLoading: false,
    isSaving: false,
    isExporting: false,
    isExportingSession: false,
    isDirty: false,
}

const createUIMethods = (set) => ({
    setSessionActionLoading: (isLoading) => set({ isSessionActionLoading: isLoading }),
    setSaving: (isSaving) => set({ isSaving }),
    setExporting: (isExporting) => set({ isExporting }),
    setExportingSession: (isExportingSession) => set({ isExportingSession }),
    setDirty: (isDirty) => set({ isDirty }),
    resetUIState: () => set({ ...initialState }),
})

const useUIStore = create(
    devtools(
        (set) => ({
            ...initialState,
            ...createUIMethods(set),
        }),
        { name: 'UIStore' }
    )
)

export default useUIStore
