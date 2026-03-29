import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useResultStore from '../store/ResultStore'
import useTreeStore from '../store/TreeStore'
import useDeviceStore from '../store/DeviceStore'
import useSessionStore from '../store/SessionStore'
import { ResultItemView } from '../components/results/ResultItemView'
import { AssetResultsView } from '../components/results/AssetResultsView'
import BackIcon from '../components/common/BackIcon'
import styles from './ModifySessionView.module.css'

// Helper function to filter results for modify session
function getFilteredResults(results, trees) {
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

// Custom hook to manage the logic for Modify Session view
function useModifySessionLogic() {
    const navigate = useNavigate()
    const results = useResultStore((state) => state.results)
    const trees = useTreeStore((state) => state.trees)
    const device = useDeviceStore((state) => state.currentDevice)
    const resultsPerAsset = useSessionStore((state) => state.resultsPerAsset)
    const [expandedRequirement, setExpandedRequirement] = useState(null)
    const [selectedAsset, setSelectedAsset] = useState(null)

    const filteredResults = useMemo(() => getFilteredResults(results, trees), [results, trees])

    const handleToggleRequirement = (requirementId) => {
        setExpandedRequirement(expandedRequirement === requirementId ? null : requirementId)
        setSelectedAsset(null)
    }

    const handleSelectAsset = (assetId) => {
        setSelectedAsset(assetId)
    }

    const handleResumeTest = () => {
        if (!selectedAsset || !expandedRequirement || !device || !trees) return
        const assetIndex = device.assets.findIndex((asset) => asset.id === selectedAsset)
        const treeIndex = trees.findIndex((tree) => tree.id === expandedRequirement)
        if (assetIndex === -1 || treeIndex === -1) return

        // Get the complete node data from TreeStore (same as SessionService does)
        const firstNode = useTreeStore.getState().getNodeByTreeIndexAndNodeId(treeIndex, 'node1')

        if (!firstNode) return

        // Set the device position and current node (same flow as loading a session)
        useSessionStore.getState().setDevicePosition(assetIndex, treeIndex, 'node1')
        useSessionStore.getState().setCurrentNode(firstNode)
        // Truncate pastHistory to keep only responses before this position
        useSessionStore.getState().truncateHistoryByPosition(assetIndex, treeIndex)
        // Clear futureHistory to ensure we use normal answer endpoint (not go_back)
        useSessionStore.getState().clearFuture()
        // Set resume mode to use go_back endpoint for next answer
        useSessionStore.getState().setResumeMode(true)
        // After starting a modification run, hide Modify Session on subsequent results screens
        useSessionStore.getState().setSessionUploaded(false)
        useSessionStore.getState().setTestFinished(false)

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

function ResultsList({ ...props }) {
    const {
        filteredResults,
        expandedRequirement,
        device,
        resultsPerAsset,
        onToggleRequirement,
        onSelectAsset,
    } = props
    const trees = useTreeStore((state) => state.trees)

    return (
        <div className={styles.resultsListContainer}>
            {filteredResults.map((result) => {
                // Find the tree for this requirement to get dependencies
                const tree = trees.find((treeItem) => treeItem.id === result.code)
                const dependencies = tree?.dependencies || []

                return (
                    <div key={result.code}>
                        <ResultItemView
                            item={result}
                            isExpanded={expandedRequirement === result.code}
                            onToggleExpand={() => onToggleRequirement(result.code)}
                        />
                        {expandedRequirement === result.code && device?.assets && (
                            <AssetResultsView
                                assets={device.assets}
                                requirementId={result.code}
                                resultsPerAsset={resultsPerAsset}
                                onAssetSelect={onSelectAsset}
                                dependencies={dependencies}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default function ModifySessionView() {
    const logic = useModifySessionLogic()

    if (!logic.filteredResults || logic.filteredResults.length === 0) {
        return <div className={styles.container}>No base requirements available</div>
    }

    return (
        <div className={styles.container}>
            <BackIcon className={styles.backIcon} onBack={logic.handleBack} />
            <header className={styles.header}>
                <h1>Modify Session</h1>
            </header>
            <ResultsList
                filteredResults={logic.filteredResults}
                expandedRequirement={logic.expandedRequirement}
                device={logic.device}
                resultsPerAsset={logic.resultsPerAsset}
                onToggleRequirement={logic.handleToggleRequirement}
                onSelectAsset={logic.handleSelectAsset}
            />
            <div className={styles.actions}>
                <button
                    className={styles.actionButton}
                    onClick={logic.handleResumeTest}
                    disabled={!logic.selectedAsset}
                >
                    Resume test from here
                </button>
            </div>
        </div>
    )
}
