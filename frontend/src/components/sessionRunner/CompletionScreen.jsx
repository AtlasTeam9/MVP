import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../../pages/SessionRunnerView.module.css'

// TODO: temporaneo, finche non viene implementata la schermata dei risultati

// Component for rendering the completion screen after finishing the session
function CompletionScreen({ onHomeClick }) {
    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Test Completed!</h1>
            </header>
            <main className={styles.completionContainer}>
                <h2>Session Finished</h2>
                <p>Thank you for completing the test.</p>
                <button onClick={() => navigate('/device/results')} className={styles.btnPrimary}>
                    View Results
                </button>
                <button onClick={onHomeClick} className={styles.btnSecondary}>
                    Back to Home
                </button>
            </main>
        </div>
    )
}

export { CompletionScreen }
