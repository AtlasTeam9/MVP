import React from 'react'
import styles from '@presentation/components/results/ResultItemView.module.css'

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
export function ResultItemView({ item, isExpanded, onToggleExpand, showExpandIcon = true }) {
    const { code, status } = item
    const isInteractive = typeof onToggleExpand === 'function'

    // Determine display status: if empty or null, show NOT_COMPLETED
    const displayStatus = status && status.trim() !== '' ? status : 'NOT_COMPLETED'

    const Wrapper = isInteractive ? 'button' : 'div'

    return (
        <div className={styles.itemContainer}>
            <Wrapper
                type={isInteractive ? 'button' : undefined}
                className={`${styles.contentWrapper} ${isInteractive ? styles.contentWrapperInteractive : ''}`}
                onClick={isInteractive ? onToggleExpand : undefined}
                aria-expanded={isInteractive ? isExpanded : undefined}
            >
                <div className={styles.headerSection}>
                    <h3 className={styles.code}>{code}</h3>
                    <span className={`${styles.status} ${getStatusClass(displayStatus)}`}>
                        {displayStatus}
                    </span>
                    {onToggleExpand && showExpandIcon && (
                        <span
                            className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                        >
                            ▼
                        </span>
                    )}
                </div>
            </Wrapper>
        </div>
    )
}
