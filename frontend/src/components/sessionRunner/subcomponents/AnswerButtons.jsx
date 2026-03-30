import React from 'react'
import styles from '../SessionRunnerComponents.module.css'

// Component for rendering the Yes/No answer buttons
function AnswerButtons({ isLoading, currentNode, onYes, onNo }) {
    const isDisabled = isLoading || !currentNode
    return (
        <div className={styles.answerButtons}>
            <button type="button" onClick={onYes} disabled={isDisabled} className={styles.btnYes}>
                YES
            </button>
            <button type="button" onClick={onNo} disabled={isDisabled} className={styles.btnNo}>
                NO
            </button>
        </div>
    )
}

export { AnswerButtons }
