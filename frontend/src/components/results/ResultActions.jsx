import React from 'react'
import { ExportDialog } from './ExportDialog'
import HomeIcon from '../common/HomeIcon'
import styles from '../../pages/ResultView.module.css'

// Actions component for handling result view buttons
export function ResultActions({
    isTestFinished,
    isExporting,
    isExportingSession,
    showFormatDialog,
    onResumeSession,
    onExportClick,
    onExportSessionClick,
    onFormatSelect,
    onCloseDialog,
}) {
    return (
        <>
            <div className={styles.actions}>
                {!isTestFinished && (
                    <button className={styles.actionButton} onClick={onResumeSession}>
                        Resume Session
                    </button>
                )}
                <button
                    className={styles.actionButton}
                    onClick={onExportClick}
                    disabled={isExporting}
                >
                    {isExporting ? 'Exporting...' : 'Export Results'}
                </button>
                <button
                    className={styles.actionButton}
                    onClick={onExportSessionClick}
                    disabled={isExportingSession}
                >
                    {isExportingSession ? 'Exporting...' : 'Export Session'}
                </button>
                <HomeIcon />
            </div>
            {showFormatDialog && (
                <ExportDialog onFormatSelect={onFormatSelect} onCancel={onCloseDialog} />
            )}
        </>
    )
}
