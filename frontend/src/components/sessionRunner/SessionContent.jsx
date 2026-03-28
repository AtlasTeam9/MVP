import React from 'react'
import styles from '../../pages/SessionRunnerView.module.css'
import { SessionHeader, QuestionSection, NavigationFooter } from './subcomponents'

// Main component for rendering the session content,
// including header, question section, and navigation footer
function SessionContent({
    currentDevice,
    currentNode,
    currentAssetIndex,
    currentTreeIndex,
    isLoading,
    error,
    onYes,
    onNo,
    onBack,
    onForward,
    onHome,
    onSaveExit,
    pastHistory,
    futureHistory,
    trees,
}) {
    const headerProps = {
        currentDevice,
        currentAssetIndex,
        onSaveExit,
        pastHistory,
    }
    const questionProps = { currentNode, currentTreeIndex, trees, error, isLoading, onYes, onNo }
    const footerProps = { pastHistory, futureHistory, isLoading, onBack, onHome, onForward }

    return (
        <div className={styles.container}>
            <SessionHeader {...headerProps} />
            <QuestionSection {...questionProps} />
            <NavigationFooter {...footerProps} />
        </div>
    )
}

export { SessionContent }
