import React, { useState } from 'react'
import { AssetInfoOverlay } from '@presentation/components/deviceSummary/AssetInfoOverlay'
import styles from '@presentation/components/deviceSummary/AssetItemView.module.css'

// Component to display an asset item in the list of assets of a device in the device summary view.
// When clicked, it shows the asset information in an overlay.
// If the showDeleteIcon prop is true, it also shows a delete icon that allows to delete the asset.
export function AssetItemView({ asset, showDeleteIcon = false, onDelete }) {
    const [showInfo, setShowInfo] = useState(false)

    const openAssetInfo = () => setShowInfo(true)

    const handleOpenInfoWithKeyboard = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openAssetInfo()
        }
    }

    const handleDeleteClick = (eve) => {
        eve.stopPropagation()
        if (onDelete) {
            onDelete(asset.id)
        }
    }

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                className={styles.itemContainer}
                onClick={openAssetInfo}
                onKeyDown={handleOpenInfoWithKeyboard}
                aria-label={`Open details for ${asset.name}`}
            >
                <div className={styles.itemContent}>
                    <span className={styles.assetName}>{asset.name}</span>
                    <span className={styles.assetType}>{asset.type}</span>
                </div>

                {showDeleteIcon && (
                    <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={handleDeleteClick}
                        title="Delete asset"
                        aria-label={`Delete asset ${asset.name}`}
                    >
                        🗑️
                    </button>
                )}
            </div>

            {showInfo && <AssetInfoOverlay asset={asset} onClose={() => setShowInfo(false)} />}
        </>
    )
}
