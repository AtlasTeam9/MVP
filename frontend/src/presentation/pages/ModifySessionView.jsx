import { ResultItemView } from '@presentation/components/results/ResultItemView'
import { AssetResultsView } from '@presentation/components/results/AssetResultsView'
import BackIcon from '@presentation/components/common/BackIcon'
import { useModifySessionLogic } from '@application/hooks/useModifySessionLogic'
import styles from '@presentation/pages/ModifySessionView.module.css'
import resultListStyles from '@presentation/components/results/ResultListView.module.css'

function ResultsList({ ...props }) {
    const {
        filteredResults,
        expandedRequirement,
        device,
        resultsPerAsset,
        dependenciesByRequirement,
        onToggleRequirement,
        onSelectAsset,
    } = props

    const safeDependenciesByRequirement = dependenciesByRequirement || {}

    return (
        <div className={resultListStyles.listContainer}>
            {filteredResults.map((result) => {
                const dependencies = safeDependenciesByRequirement[result.code] || []

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
        return (
            <div className={`page-shell page-shell--top ${styles.container}`}>
                No base requirements available
            </div>
        )
    }

    return (
        <div className={`page-shell page-shell--top ${styles.container}`}>
            <BackIcon onBack={logic.handleBack} />
            <header className={styles.header}>
                <h1>Modify Session</h1>
            </header>
            <ResultsList
                filteredResults={logic.filteredResults}
                expandedRequirement={logic.expandedRequirement}
                device={logic.device}
                resultsPerAsset={logic.resultsPerAsset}
                dependenciesByRequirement={logic.dependenciesByRequirement}
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


