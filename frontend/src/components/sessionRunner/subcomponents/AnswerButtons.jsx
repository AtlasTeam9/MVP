import React from 'react'
import styles from '../../../pages/SessionRunnerView.module.css'

// Component for rendering the Yes/No answer buttons
function AnswerButtons({ isLoading, currentNode, onYes, onNo }) {
    const isDisabled = isLoading || !currentNode
    return (
        <div className={styles.answerButtons}>
            <button onClick={onYes} disabled={isDisabled} className={styles.btnYes}>
                YES
            </button>
            <button onClick={onNo} disabled={isDisabled} className={styles.btnNo}>
                NO
            </button>
        </div>
    )
}

export { AnswerButtons }
