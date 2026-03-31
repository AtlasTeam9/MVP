import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useResultStore from '../store/ResultStore'
import useDeviceStore from '../store/DeviceStore'
import useSessionStore from '../store/SessionStore'
import { ResultItemView } from '../components/results/ResultItemView'
import { AssetResultsView } from '../components/results/AssetResultsView'
import { ResultActions } from '../components/results/ResultActions'
import { useExportResults } from '../hooks/useExportResults'
import { useExportSession } from '../hooks/useExportSession'
import { resetSessionAndNavigateHome } from '../services/NavigationService'
import styles from './ResultView.module.css'
import resultListStyles from '../components/results/ResultListView.module.css'

function EmptyResultsState() {
    return (
        <div className={`page-shell page-shell--top ${styles.container}`}>No results available</div>
    )
}

export default function ResultView() {
    const navigate = useNavigate()
    const results = useResultStore((state) => state.results)
    const device = useDeviceStore((state) => state.currentDevice)
    const sessionId = useSessionStore((state) => state.sessionId)
    const isTestFinished = useSessionStore((state) => state.isTestFinished)
    const isSessionUploaded = useSessionStore((state) => state.isSessionUploaded)
    const resultsPerAsset = useSessionStore((state) => state.resultsPerAsset)
    const [expandedRequirement, setExpandedRequirement] = useState(null)
    const {
        isExporting,
        showFormatDialog,
        handleExportClick,
        handleExportFormat,
        setShowFormatDialog,
    } = useExportResults(sessionId)
    const { isExportingSession, handleExportSessionClick } = useExportSession(sessionId)

    const handleResumeSession = () => {
        navigate('/session/test')
    }

    const handleModifySession = () => {
        navigate('/session/modify')
    }
    const handleHome = () => resetSessionAndNavigateHome(navigate)

    const handleToggleRequirement = (requirementId) => {
        setExpandedRequirement((prev) => (prev === requirementId ? null : requirementId))
    }

    if (!results || results.length === 0) {
        return <EmptyResultsState />
    }

    return (
        <div className={`page-shell page-shell--top ${styles.container}`}>
            <header className={styles.header}>
                <h1>Test Results</h1>
            </header>
            <div className={resultListStyles.listContainer}>
                {results.map((result) => (
                    <div key={result.code}>
                        <ResultItemView
                            item={result}
                            isExpanded={expandedRequirement === result.code}
                            onToggleExpand={() => handleToggleRequirement(result.code)}
                        />
                        {expandedRequirement === result.code && device?.assets && (
                            <AssetResultsView
                                assets={device.assets}
                                requirementId={result.code}
                                resultsPerAsset={resultsPerAsset}
                                readOnly
                            />
                        )}
                    </div>
                ))}
            </div>
            <ResultActions
                isTestFinished={isTestFinished}
                isSessionUploaded={isSessionUploaded}
                isExporting={isExporting}
                isExportingSession={isExportingSession}
                showFormatDialog={showFormatDialog}
                onResumeSession={handleResumeSession}
                onModifySession={handleModifySession}
                onExportClick={handleExportClick}
                onExportSessionClick={handleExportSessionClick}
                onFormatSelect={handleExportFormat}
                onCloseDialog={() => setShowFormatDialog(false)}
                onHome={handleHome}
            />
        </div>
    )
}
