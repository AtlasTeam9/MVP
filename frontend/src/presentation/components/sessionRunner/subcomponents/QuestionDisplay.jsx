import React from 'react'
import styles from '@presentation/components/sessionRunner/SessionRunnerComponents.module.css'
import { useSessionRunnerContext } from '@presentation/components/sessionRunner/SessionRunnerContext'

// Component for rendering the question display area with question text and description
function QuestionDisplay() {
    const ctx = useSessionRunnerContext()
    const currentNode = ctx?.currentNode
    const currentTreeIndex = ctx?.currentTreeIndex ?? 0
    const trees = ctx?.trees ?? []
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
                        <p className={styles.questionDescription}>
                            {currentNode.description}
                        </p>
                    )}
                </>
            ) : (
                <p className={styles.loadingText}>Loading question...</p>
            )}
        </div>
    )
}

export { QuestionDisplay }
