import React, { useState } from 'react'
import styles from './AssetResultsView.module.css'

// Helper function to get status CSS class
function getStatusClass(status) {
    switch (status) {
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

// Helper function to check if asset has NOT_APPLICABLE dependency
function hasNotApplicableDependency(assetResultsObj, dependencies) {
    return dependencies?.some((depId) => assetResultsObj?.[depId] === 'NOT_APPLICABLE')
}

// Helper function to check if asset can be clicked
function isAssetClickable(status, assetResultsObj, dependencies) {
    // If requirement has no dependencies, any asset is clickable
    if (!dependencies || dependencies.length === 0) {
        return true
    }

    // If requirement has dependencies:
    // - Not clickable if status is NOT_APPLICABLE
    if (status === 'NOT_APPLICABLE') {
        return false
    }

    // - Not clickable if any dependency is NOT_APPLICABLE for this asset
    return !hasNotApplicableDependency(assetResultsObj, dependencies)
}

// Asset item component
function AssetItem({ asset, status, isSelected, clickable, onAssetClick }) {
    return (
        <div
            className={`${styles.assetItem} ${isSelected ? styles.selected : ''} ${!clickable ? styles.disabled : ''}`}
            onClick={() => clickable && onAssetClick(asset.id)}
            style={{ cursor: clickable ? 'pointer' : 'not-allowed', opacity: clickable ? 1 : 0.6 }}
            title={
                clickable
                    ? 'Click this asset and resume from here'
                    : "You can't resume the test from this asset due to NOT_APPLICABLE dependencies"
            }
        >
            <div className={styles.assetInfo}>
                <span className={styles.assetName}>{asset.name}</span>
            </div>
            <span className={`${styles.status} ${getStatusClass(status)}`}>{status}</span>
        </div>
    )
}

// Component that displays assets and their results for a specific requirement
export function AssetResultsView({
    assets,
    requirementId,
    resultsPerAsset,
    onAssetSelect,
    dependencies = [],
}) {
    const [selectedAssetId, setSelectedAssetId] = useState(null)

    if (!assets || !resultsPerAsset) {
        return <div className={styles.container}>No assets available</div>
    }

    return (
        <div className={styles.container}>
            {assets.map((asset) => {
                const assetResultsObj = resultsPerAsset[asset.id]
                const status = assetResultsObj?.[requirementId] || 'NOT_COMPLETED'
                const clickable = isAssetClickable(status, assetResultsObj, dependencies)

                return (
                    <AssetItem
                        key={asset.id}
                        asset={asset}
                        status={status}
                        isSelected={selectedAssetId === asset.id}
                        clickable={clickable}
                        onAssetClick={(assetId) => {
                            setSelectedAssetId(assetId)
                            onAssetSelect?.(assetId)
                        }}
                    />
                )
            })}
        </div>
    )
}
