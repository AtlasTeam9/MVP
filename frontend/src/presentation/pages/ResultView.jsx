import { ResultItemView } from '@presentation/components/results/ResultItemView'
import { AssetResultsView } from '@presentation/components/results/AssetResultsView'
import { ResultActions } from '@presentation/components/results/ResultActions'
import { useResultViewLogic } from '@application/hooks/useResultViewLogic'
import styles from '@presentation/pages/ResultView.module.css'
import resultListStyles from '@presentation/components/results/ResultListView.module.css'

// Rendered when no result payload is available yet or the result list is empty.
function EmptyResultsState() {
    return (
        <div className={`page-shell page-shell--top ${styles.container}`}>No results available</div>
    )
}

export default function ResultView() {
    const logic = useResultViewLogic()

    if (!logic.results || logic.results.length === 0) {
        return <EmptyResultsState />
    }

    return (
        <div className={`page-shell page-shell--top ${styles.container}`}>
            <header className={styles.header}>
                <h1>Test Results</h1>
            </header>
            <div className={resultListStyles.listContainer}>
                {logic.results.map((result) => (
                    <div key={result.code}>
                        <ResultItemView
                            item={result}
                            isExpanded={logic.expandedRequirement === result.code}
                            onToggleExpand={() => logic.handleToggleRequirement(result.code)}
                        />
                        {logic.expandedRequirement === result.code && logic.device?.assets && (
                            <AssetResultsView
                                assets={logic.device.assets}
                                requirementId={result.code}
                                resultsPerAsset={logic.resultsPerAsset}
                                readOnly
                            />
                        )}
                    </div>
                ))}
            </div>
            <ResultActions
                isTestFinished={logic.isTestFinished}
                isSessionUploaded={logic.isSessionUploaded}
                isExporting={logic.isExporting}
                isExportingSession={logic.isExportingSession}
                showFormatDialog={logic.showFormatDialog}
                onResumeSession={logic.handleResumeSession}
                onModifySession={logic.handleModifySession}
                onExportClick={logic.handleExportClick}
                onExportSessionClick={logic.handleExportSessionClick}
                onFormatSelect={logic.handleExportFormat}
                onCloseDialog={() => logic.setShowFormatDialog(false)}
                onHome={logic.handleHome}
            />
        </div>
    )
}


