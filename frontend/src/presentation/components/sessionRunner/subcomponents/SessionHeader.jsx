import React from 'react'
import styles from '@presentation/components/sessionRunner/SessionRunnerComponents.module.css'
import { calculateCompletionPercentage } from '@application/services/sessionHelpers/progressCalculator'
import { useSessionRunnerContext } from '@presentation/components/sessionRunner/SessionRunnerContext'

// Component for rendering the session header with
// device and asset information, completion percentage, and Save & Exit button
function SessionHeader() {
    const ctx = useSessionRunnerContext()
    const device = ctx?.currentDevice
    const assetIndex = ctx?.currentAssetIndex ?? 0
    const treeIndex = ctx?.currentTreeIndex ?? 0
    const pastHistory = ctx?.pastHistory ?? []
    const trees = ctx?.trees ?? []

    const completionPercentage = calculateCompletionPercentage(
        assetIndex,
        pastHistory,
        trees,
        device?.assets,
        treeIndex
    )
    const currentAsset = device?.assets?.[assetIndex]

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.completionInfo}>
                    <span className={styles.completionLabel}>Test</span>
                    <div className={styles.completionPercentage}>{completionPercentage}%</div>
                </div>
                <div className={styles.deviceInfo}>
                    <h2 className={styles.deviceName}>{device?.name}</h2>
                    {currentAsset && (
                        <p className={styles.assetName}>
                            <strong>Asset:</strong> {currentAsset.name}
                        </p>
                    )}
                </div>
            </div>
            <button type="button" onClick={ctx?.onSaveExit} className={styles.btnExit}>
                Save & Exit
            </button>
        </header>
    )
}

export { SessionHeader }


