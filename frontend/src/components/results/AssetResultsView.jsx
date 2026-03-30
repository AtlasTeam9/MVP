import React, { useState } from 'react'
import styles from './AssetResultsView.module.css'
import {
    getAssetStatus,
    getAssetStatusClass,
    isAssetClickable,
} from './assetResultsUtils'

// Asset item component
function AssetItem({ asset, status, isSelected, clickable, onAssetClick }) {
    return (
        <button
            type="button"
            className={`${styles.assetItem} ${isSelected ? styles.selected : ''} ${!clickable ? styles.disabled : ''}`}
            onClick={() => clickable && onAssetClick(asset.id)}
            disabled={!clickable}
            title={
                clickable
                    ? 'Click this asset and resume from here'
                    : "You can't resume the test from this asset due to NOT_APPLICABLE dependencies"
            }
            aria-label={`Select asset ${asset.name}`}
        >
            <div className={styles.assetInfo}>
                <span className={styles.assetName}>{asset.name}</span>
            </div>
            <span className={`${styles.status} ${getAssetStatusClass(status, styles)}`}>
                {status}
            </span>
        </button>
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
                const status = getAssetStatus(asset.id, requirementId, resultsPerAsset)
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
