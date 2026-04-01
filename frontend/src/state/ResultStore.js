import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Methods to manage results state
const createResultMethods = (set) => ({
    setResults: (results) => set({ results }),
    clearStore: () => set({ results: [] }),
})

// Combine all methods into a single store
const useResultStore = create(
    devtools(
        (set) => ({
            // Results fields
            results: [],

            // Merge all methods
            ...createResultMethods(set),
        }),
        { name: 'ResultStore' }
    )
)

export default useResultStore
