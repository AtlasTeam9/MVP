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
        default:
            return ''
    }
}

// Component that renders a single requirement result item
export function ResultItemView({ item }) {
    const { code, status } = item
    const isModifiable = false // TODO: implementare se serve

    return (
        <div className={styles.itemContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.headerSection}>
                    <h3 className={styles.code}>{code}</h3>
                    <span className={`${styles.status} ${getStatusClass(status)}`}>{status}</span>
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
