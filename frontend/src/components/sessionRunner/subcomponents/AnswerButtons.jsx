import React from 'react'
import styles from '../SessionRunnerComponents.module.css'
import { useSessionRunnerContext } from '../SessionRunnerContext'

// Component for rendering the Yes/No answer buttons
function AnswerButtons() {
    const ctx = useSessionRunnerContext()
    const isDisabled = (ctx?.isLoading ?? false) || !ctx?.currentNode

    return (
        <div className={styles.answerButtons}>
            <button
                type="button"
                onClick={ctx?.onYes}
                disabled={isDisabled}
                className={styles.btnYes}
            >
                YES
            </button>
            <button
                type="button"
                onClick={ctx?.onNo}
                disabled={isDisabled}
                className={styles.btnNo}
            >
                NO
            </button>
        </div>
    )
}

export { AnswerButtons }
