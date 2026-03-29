import React from 'react'
import styles from './ResultItemView.module.css'

const getStatusClass = (stat) => {
    switch (stat) {
        case 'PASS':
            return styles.statusPass
        case 'FAIL':
            return styles.statusFail
        case 'NOT_APPLICABLE':
            return styles.statusNotApplicable
        case 'NOT_COMPLETED':
            return styles.statusNotCompleted
        default:
            return ''
    }
}

// Component that renders a single requirement result item
export function ResultItemView({ item, isExpanded, onToggleExpand }) {
    const { code, status } = item
    const isModifiable = false // TODO: implementare se serve
    const isInteractive = typeof onToggleExpand === 'function'

    // Determine display status: if empty or null, show NOT_COMPLETED
    const displayStatus = status && status.trim() !== '' ? status : 'NOT_COMPLETED'

    return (
        <div className={styles.itemContainer}>
            <div
                className={styles.contentWrapper}
                onClick={isInteractive ? onToggleExpand : undefined}
                style={{ cursor: isInteractive ? 'pointer' : 'default' }}
            >
                <div className={styles.headerSection}>
                    <h3 className={styles.code}>{code}</h3>
                    <span className={`${styles.status} ${getStatusClass(displayStatus)}`}>
                        {displayStatus}
                    </span>
                    {onToggleExpand && (
                        <span
                            className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                        >
                            ▼
                        </span>
                    )}
                </div>
            </div>

            {isModifiable && (
                <div className={styles.actions}>
                    <button className={styles.modifyButton}>Modify</button>
                </div>
            )}
        </div>
    )
}
