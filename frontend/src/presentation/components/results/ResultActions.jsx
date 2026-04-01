import React from 'react'
import { ExportDialog } from '@presentation/components/results/ExportDialog'
import HomeIcon from '@presentation/components/common/HomeIcon'
import styles from '@presentation/components/results/ResultActions.module.css'

function ActionButton({ onClick, disabled, label }) {
    return (
        <button type="button" className={styles.actionButton} onClick={onClick} disabled={disabled}>
            {label}
        </button>
    )
}

// Actions component for handling result view buttons
export function ResultActions({
    isTestFinished,
    isSessionUploaded,
    isExporting,
    isExportingSession,
    showFormatDialog,
    onResumeSession,
    onModifySession,
    onExportClick,
    onExportSessionClick,
    onFormatSelect,
    onCloseDialog,
    onHome,
}) {
    const showModifySession = isTestFinished && isSessionUploaded

    return (
        <>
            <div className={styles.actions}>
                {!isTestFinished && (
                    <ActionButton onClick={onResumeSession} label="Resume Session" />
                )}
                {showModifySession && (
                    <ActionButton onClick={onModifySession} label="Modify Session" />
                )}
                <ActionButton
                    onClick={onExportClick}
                    disabled={isExporting}
                    label={isExporting ? 'Exporting...' : 'Export Results'}
                />
                <ActionButton
                    onClick={onExportSessionClick}
                    disabled={isExportingSession}
                    label={isExportingSession ? 'Exporting...' : 'Export Session'}
                />
                <HomeIcon onHome={onHome} />
            </div>
            {showFormatDialog && (
                <ExportDialog onFormatSelect={onFormatSelect} onCancel={onCloseDialog} />
            )}
        </>
    )
}
