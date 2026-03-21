import React from 'react'
import { AssetInfo } from './AssetInfo'

export function AssetInfoOverlay({ asset, onClose }) {
    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(eve) => eve.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Asset details</h2>
                    <button style={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>
                <AssetInfo asset={asset} isSensitive={asset.is_sensitive || false} />
            </div>
        </div>
    )
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        background: '#1a3a4d',
        borderRadius: '12px',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '450px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    title: {
        color: 'white',
        fontSize: '1.3rem',
        margin: 0,
        fontWeight: '600',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: 0,
    },
}
