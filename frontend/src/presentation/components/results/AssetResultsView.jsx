import React, { useState } from 'react'
import styles from '@presentation/components/results/AssetResultsView.module.css'
import { getAssetStatus, getAssetStatusClass, isAssetClickable } from '@presentation/components/results/assetResultsUtils'

// Asset item component
function AssetItem({ asset, status, isSelected, clickable, onAssetClick, readOnly }) {
    const Wrapper = readOnly ? 'div' : 'button'
    return (
        <Wrapper
            type={readOnly ? undefined : 'button'}
            className={`${styles.assetItem} ${readOnly ? styles.readOnly : ''} ${isSelected ? styles.selected : ''} ${!readOnly && !clickable ? styles.disabled : ''}`}
            onClick={!readOnly && clickable ? () => onAssetClick(asset.id) : undefined}
            disabled={!readOnly && !clickable ? true : undefined}
            title={
                readOnly
                    ? undefined
                    : clickable
                      ? 'Click this asset and resume from here'
                      : "You can't resume the test from this asset due to NOT_APPLICABLE dependencies"
            }
            aria-label={`Asset ${asset.name}`}
        >
            <div className={styles.assetInfo}>
                <span className={styles.assetName}>{asset.name}</span>
            </div>
            <span className={`${styles.status} ${getAssetStatusClass(status, styles)}`}>
                {status}
            </span>
        </Wrapper>
    )
}

// Component that displays assets and their results for a specific requirement
export function AssetResultsView({
    assets,
    requirementId,
    resultsPerAsset,
    onAssetSelect,
    dependencies = [],
    readOnly = false,
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
                const clickable =
                    !readOnly && isAssetClickable(status, assetResultsObj, dependencies)
                const isSelected = !readOnly && selectedAssetId === asset.id

                return (
                    <AssetItem
                        key={asset.id}
                        asset={asset}
                        status={status}
                        isSelected={isSelected}
                        clickable={clickable}
                        readOnly={readOnly}
                        onAssetClick={(assetId) => {
                            if (readOnly) return
                            setSelectedAssetId(assetId)
                            onAssetSelect?.(assetId)
                        }}
                    />
                )
            })}
        </div>
    )
}
