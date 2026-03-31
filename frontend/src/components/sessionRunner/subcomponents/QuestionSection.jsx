import React from 'react'
import styles from '../SessionRunnerComponents.module.css'
import { QuestionDisplay } from './QuestionDisplay'
import { AnswerButtons } from './AnswerButtons'
import { useSessionRunnerContext } from '../SessionRunnerContext'

// Component for rendering the main question section with the question display and answer buttons
function QuestionSection() {
    const ctx = useSessionRunnerContext()
    const error = ctx?.error

    return (
        <main className={styles.mainContent}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <QuestionDisplay />
            <AnswerButtons />
        </main>
    )
}

export { QuestionSection }
