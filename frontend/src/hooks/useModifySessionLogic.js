import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useResultStore from '../store/ResultStore'
import useTreeStore from '../store/TreeStore'
import useDeviceStore from '../store/DeviceStore'
import useSessionStore from '../store/SessionStore'
import sessionService from '../services/SessionService'

export function getFilteredResults(results, trees) {
    if (!results || !trees) return []

    const noDependenciesTrees = trees
        .filter((tree) => !tree.dependencies || tree.dependencies.length === 0)
        .map((tree) => tree.id)

    return results.filter((result) => {
        if (noDependenciesTrees.includes(result.code)) return true
        if (result.status === 'PASS' || result.status === 'FAIL') return true
        return false
    })
}

export function useModifySessionLogic() {
    const navigate = useNavigate()
    const results = useResultStore((state) => state.results)
    const trees = useTreeStore((state) => state.trees)
    const device = useDeviceStore((state) => state.currentDevice)
    const resultsPerAsset = useSessionStore((state) => state.resultsPerAsset)
    const [expandedRequirement, setExpandedRequirement] = useState(null)
    const [selectedAsset, setSelectedAsset] = useState(null)

    const filteredResults = useMemo(() => getFilteredResults(results, trees), [results, trees])

    const handleToggleRequirement = (requirementId) => {
        setExpandedRequirement((prev) => (prev === requirementId ? null : requirementId))
        setSelectedAsset(null)
    }

    const handleSelectAsset = (assetId) => {
        setSelectedAsset(assetId)
    }

    const handleResumeTest = () => {
        if (!selectedAsset || !expandedRequirement || !device || !trees) return

        const canResume = sessionService.resumeSession(expandedRequirement, selectedAsset)

        if (!canResume) return

        navigate('/session/test')
    }

    return {
        filteredResults,
        expandedRequirement,
        device,
        resultsPerAsset,
        selectedAsset,
        handleToggleRequirement,
        handleSelectAsset,
        handleResumeTest,
        handleBack: () => navigate('/results'),
    }
}
