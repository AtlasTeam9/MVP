import React from 'react'
import useResultStore from '../store/ResultStore'
import useSessionStore from '../store/SessionStore'
import { ResultListView } from '../components/results/ResultListView'
import { ExportDialog } from '../components/results/ExportDialog'
import HomeIcon from '../components/common/HomeIcon'
import { useExportResults } from '../hooks/useExportResults'
import { useExportSession } from '../hooks/useExportSession'
import styles from './ResultView.module.css'

export default function ResultView() {
    const results = useResultStore((state) => state.results)
    const sessionId = useSessionStore((state) => state.sessionId)
    const {
        isExporting,
        showFormatDialog,
        handleExportClick,
        handleExportFormat,
        setShowFormatDialog,
    } = useExportResults(sessionId)
    const { isExportingSession, handleExportSessionClick } = useExportSession(sessionId)

    if (!results || results.length === 0) {
        return <div className={styles.container}>No results available</div>
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Test Results</h1>
            </header>
            <ResultListView items={results} />
            <div className={styles.actions}>
                <button
                    className={styles.actionButton}
                    onClick={handleExportClick}
                    disabled={isExporting}
                >
                    {isExporting ? 'Exporting...' : 'Export Results'}
                </button>
                <button
                    className={styles.actionButton}
                    onClick={handleExportSessionClick}
                    disabled={isExportingSession}
                >
                    {isExportingSession ? 'Exporting...' : 'Export Session'}
                </button>
                <HomeIcon />
            </div>
            {showFormatDialog && (
                <ExportDialog
                    onFormatSelect={handleExportFormat}
                    onCancel={() => setShowFormatDialog(false)}
                />
            )}
        </div>
    )
}
