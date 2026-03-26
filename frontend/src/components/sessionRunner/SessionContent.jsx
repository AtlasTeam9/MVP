import React, { useEffect } from 'react'
import styles from '../../pages/SessionRunnerView.module.css'
import { SessionHeader, QuestionSection, NavigationFooter } from './subcomponents'
import { initializeProgressCalculator } from '../../infrastructure/utils/progressCalculator'

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
    // Initialize progress calculator when trees or device changes
    useEffect(() => {
        if (trees && currentDevice) {
            initializeProgressCalculator(trees, currentDevice.assets)
        }
    }, [trees, currentDevice])

    const headerProps = {
        currentDevice,
        currentAssetIndex,
        currentTreeIndex,
        onSaveExit,
        pastHistory,
    }
    const questionProps = { currentNode, error, isLoading, onYes, onNo }
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
