import React from 'react'
import useResultStore from '../store/ResultStore'
import { ResultListView } from '../components/results/ResultListView'
import styles from './ResultView.module.css'

// Page that displays the results after the test is completed
export default function ResultView() {
    const results = useResultStore((state) => state.results)

    const handleExportClick = () => {
        // TODO: Implement export functionality
    }

    const handleModifySession = () => {
        // TODO: Implement modify session functionality
    }

    const handleResumeSession = () => {
        // TODO: Implement resume session functionality
    }

    if (!results || results.length === 0) {
        return <div className={styles.container}>No results available</div>
    }
    // TODO: Quando l'utente clicca il pulsante per esportare deve selezionare il
    // TODO: formato di esportazione, per ogni formato si chiama l'api in sequenza
    // TODO: export_results
    // TODO: Non ho capito il tasto resume session qui
    // TODO: Sbaglio o non c`è alcun modo per tornare alla home?
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Test Results</h1>
            </header>

            <ResultListView items={results} />
            <div className={styles.actions}>
                <button className={styles.actionButton} onClick={handleExportClick}>
                    Export Results
                </button>
                <button className={styles.actionButton} onClick={handleModifySession}>
                    Modify Session
                </button>
                <button className={styles.actionButton} onClick={handleResumeSession}>
                    Resume Session
                </button>
            </div>
        </div>
    )
}
