import React, { useState } from 'react'
import { AssetInfoOverlay } from './AssetInfoOverlay'

export function AssetItemView({ asset, showDeleteIcon = false, onDelete }) {
    const [showInfo, setShowInfo] = useState(false)

    const handleDeleteClick = (eve) => {
        eve.stopPropagation()
        if (onDelete) {
            onDelete(asset.id)
        }
    }

    return (
        <>
            <div style={styles.itemContainer} onClick={() => setShowInfo(true)}>
                <div style={styles.itemContent}>
                    <span style={styles.assetName}>{asset.name}</span>
                    <span style={styles.assetType}>{asset.type}</span>
                </div>

                {showDeleteIcon && (
                    <button
                        style={styles.deleteBtn}
                        onClick={handleDeleteClick}
                        title="Delete asset"
                    >
                        🗑️
                    </button>
                )}
            </div>

            {showInfo && <AssetInfoOverlay asset={asset} onClose={() => setShowInfo(false)} />}
        </>
    )
}

const styles = {
    itemContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        background: 'white',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid #f0f0f0',
        marginBottom: '0.5rem',
    },
    itemContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: '1rem',
    },
    assetName: {
        color: '#333',
        fontWeight: '500',
        flex: 1,
        textAlign: 'left',
    },
    assetType: {
        color: '#007bff',
        fontSize: '0.85rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    deleteBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '0.25rem 0.5rem',
        transition: 'all 0.2s ease',
    },
}
