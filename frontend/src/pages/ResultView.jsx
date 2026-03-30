import { useNavigate } from 'react-router-dom'
import useResultStore from '../store/ResultStore'
import useSessionStore from '../store/SessionStore'
import { ResultListView } from '../components/results/ResultListView'
import { ResultActions } from '../components/results/ResultActions'
import { useExportResults } from '../hooks/useExportResults'
import { useExportSession } from '../hooks/useExportSession'
import { resetSessionAndNavigateHome } from '../services/NavigationService'
import styles from './ResultView.module.css'

function EmptyResultsState() {
    return (
        <div className={`page-shell page-shell--top ${styles.container}`}>
            No results available
        </div>
    )
}

export default function ResultView() {
    const navigate = useNavigate()
    const results = useResultStore((state) => state.results)
    const sessionId = useSessionStore((state) => state.sessionId)
    const isTestFinished = useSessionStore((state) => state.isTestFinished)
    const isSessionUploaded = useSessionStore((state) => state.isSessionUploaded)
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

    if (!results || results.length === 0) {
        return <EmptyResultsState />
    }

    return (
        <div className={`page-shell page-shell--top ${styles.container}`}>
            <header className={styles.header}>
                <h1>Test Results</h1>
            </header>
            <ResultListView items={results} />
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
