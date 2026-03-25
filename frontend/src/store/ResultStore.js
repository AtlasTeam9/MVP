import { create } from 'zustand'

// Methods to manage results state
const createResultMethods = (set) => ({
    setResults: (results) => set({ results }),
    clearResults: () => set({ results: [] }),
})

// Combine all methods into a single store
const useResultStore = create((set) => ({
    // Results fields
    results: [],

    // Merge all methods
    ...createResultMethods(set),
}))

export default useResultStore
