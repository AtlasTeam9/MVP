import React from 'react'
import useTreeStore from '../store/TreeStore'
import { ResultItemView } from '../components/results/ResultItemView'
import { AssetResultsView } from '../components/results/AssetResultsView'
import BackIcon from '../components/common/BackIcon'
import { useModifySessionLogic } from '../hooks/useModifySessionLogic'
import styles from './ModifySessionView.module.css'

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
