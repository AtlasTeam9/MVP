import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useResultStore from '@state/ResultStore'
import useTreeStore from '@state/TreeStore'
import useDeviceStore from '@state/DeviceStore'
import useSessionStore from '@state/SessionStore'
import { selectCurrentDevice } from '@state/selectors/deviceSelectors'
import { selectResults } from '@state/selectors/resultSelectors'
import { selectResultsPerAsset } from '@state/selectors/sessionSelectors'
import { selectDependenciesByRequirement, selectTrees } from '@state/selectors/treeSelectors'
import { filterResumableResults } from '@domain/treeRules'
import sessionService from '@application/services/SessionService'

export function getFilteredResults(results, trees) {
    if (!results || !trees) return []
    return filterResumableResults(results, trees)
}

export function useModifySessionLogic() {
    const navigate = useNavigate()
    const results = useResultStore(selectResults)
    const trees = useTreeStore(selectTrees)
    const dependenciesByRequirement = useTreeStore(selectDependenciesByRequirement) || {}
    const device = useDeviceStore(selectCurrentDevice)
    const resultsPerAsset = useSessionStore(selectResultsPerAsset) || {}
    const [expandedRequirement, setExpandedRequirement] = useState(null)
    const [selectedAsset, setSelectedAsset] = useState(null)

    const filteredResults = useMemo(
        () => getFilteredResults(results || [], trees || []),
        [results, trees]
    )
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
        dependenciesByRequirement,
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
