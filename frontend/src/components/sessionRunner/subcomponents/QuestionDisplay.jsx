import React from 'react'
import styles from '../../../pages/SessionRunnerView.module.css'

// Component for rendering the question display area with question text and description
function QuestionDisplay({ currentNode, currentTreeIndex, trees }) {
    const currentTreeTitle = trees?.[currentTreeIndex]?.title || ''

    return (
        <div className={styles.questionContainer}>
            {currentNode ? (
                <>
                    {currentTreeTitle && (
                        <h3 className={styles.treeTitleText}>{currentTreeTitle}</h3>
                    )}
                    <div className={styles.nodeInfo}>
                        <span className={styles.nodeId}>{currentNode.id}</span>
                    </div>
                    <h3 className={styles.questionText}>{currentNode.text}</h3>
                    {currentNode.description && (
                        <p className={styles.questionDescription}>{currentNode.description}</p>
                    )}
                </>
            ) : (
                <p className={styles.loadingText}>Loading question...</p>
            )}
        </div>
    )
}

export { QuestionDisplay }
