import React from 'react'
import styles from '../../../pages/SessionRunnerView.module.css'
import { calculateCompletionPercentage } from '../../../infrastructure/utils/progressCalculator'

// Component for rendering the session header with
// device and asset information, completion percentage, and Save & Exit button
function SessionHeader({ currentDevice, currentAssetIndex, onSaveExit, pastHistory }) {
    const completionPercentage = calculateCompletionPercentage(
        currentAssetIndex,
        pastHistory,
        currentDevice?.assets
    )
    const currentAsset = currentDevice?.assets?.[currentAssetIndex]

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.completionInfo}>
                    <span className={styles.completionLabel}>Test</span>
                    <div className={styles.completionPercentage}>{completionPercentage}%</div>
                </div>
                <div className={styles.deviceInfo}>
                    <h2 className={styles.deviceName}>{currentDevice?.name}</h2>
                    {currentAsset && (
                        <p className={styles.assetName}>
                            <strong>Asset:</strong> {currentAsset.name}
                        </p>
                    )}
                </div>
            </div>
            <button onClick={onSaveExit} className={styles.btnExit}>
                Save & Exit
            </button>
        </header>
    )
}

export { SessionHeader }
