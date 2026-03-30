import React from 'react'
import styles from './InfoPanels.module.css'

// Component to display asset information in the overlay when an asset is selected in
// the device summary view.
export function AssetInfo({ asset }) {
    return (
        <div className={styles.content}>
            <div className={`${styles.fieldBase} ${styles.assetField}`}>
                <span className={`${styles.labelBase} ${styles.assetLabel}`}>ID:</span>
                <span className={styles.value}>{asset.id}</span>
            </div>

            <div className={`${styles.fieldBase} ${styles.assetField}`}>
                <span className={`${styles.labelBase} ${styles.assetLabel}`}>Name:</span>
                <span className={styles.value}>{asset.name}</span>
            </div>

            <div className={`${styles.fieldBase} ${styles.assetField}`}>
                <span className={`${styles.labelBase} ${styles.assetLabel}`}>Type:</span>
                <span className={styles.value}>{asset.type}</span>
            </div>

            <div className={`${styles.fieldBase} ${styles.assetField}`}>
                <span className={`${styles.labelBase} ${styles.assetLabel}`}>Sensitive:</span>
                <span className={styles.value}>{asset.isSensitive ? 'Yes' : 'No'}</span>
            </div>

            <div className={`${styles.fieldBase} ${styles.assetField}`}>
                <span className={`${styles.labelBase} ${styles.assetLabel}`}>Description:</span>
                <span className={styles.value}>{asset.description || '—'}</span>
            </div>
        </div>
    )
}
