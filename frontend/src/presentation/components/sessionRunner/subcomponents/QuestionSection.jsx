import React from 'react'
import styles from '@presentation/components/sessionRunner/SessionRunnerComponents.module.css'
import { QuestionDisplay } from '@presentation/components/sessionRunner/subcomponents/QuestionDisplay'
import { AnswerButtons } from '@presentation/components/sessionRunner/subcomponents/AnswerButtons'
import { useSessionRunnerContext } from '@presentation/components/sessionRunner/SessionRunnerContext'

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
