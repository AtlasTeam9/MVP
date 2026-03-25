import React from 'react'
import styles from './ResultItemView.module.css'

// Component that renders a single requirement result item
export function ResultItemView({ item }) {
    const { code, name, status, description } = item
    const isModifiable = false // TODO: implement modification logic

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

    return (
        <div className={styles.itemContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.headerSection}>
                    <div className={styles.codeAndName}>
                        <span className={styles.code}>{code}</span>
                        <h3 className={styles.name}>{name}</h3>
                    </div>
                    <span className={`${styles.status} ${getStatusClass(status)}`}>{status}</span>
                </div>

                {description && <p className={styles.description}>{description}</p>}
            </div>

            {isModifiable && (
                <div className={styles.actions}>
                    <button className={styles.modifyButton}>Modify</button>
                </div>
            )}
        </div>
    )
}
