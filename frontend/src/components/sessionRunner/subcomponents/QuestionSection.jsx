import React from 'react'
import styles from '../SessionRunnerComponents.module.css'
import { QuestionDisplay } from './QuestionDisplay'
import { AnswerButtons } from './AnswerButtons'

// Component for rendering the main question section with the question display and answer buttons
function QuestionSection({ currentNode, currentTreeIndex, trees, error, isLoading, onYes, onNo }) {
    return (
        <main className={styles.mainContent}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <QuestionDisplay
                currentNode={currentNode}
                currentTreeIndex={currentTreeIndex}
                trees={trees}
            />
            <AnswerButtons
                isLoading={isLoading}
                currentNode={currentNode}
                onYes={onYes}
                onNo={onNo}
            />
        </main>
    )
}

export { QuestionSection }
