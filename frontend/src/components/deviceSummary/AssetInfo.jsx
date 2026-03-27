import React from 'react'

// Component to display asset information in the overlay when an asset is selected in
// the device summary view.
export function AssetInfo({ asset }) {
    return (
        <div style={styles.content}>
            <div style={styles.field}>
                <span style={styles.label}>ID:</span>
                <span style={styles.value}>{asset.id}</span>
            </div>

            <div style={styles.field}>
                <span style={styles.label}>Name:</span>
                <span style={styles.value}>{asset.name}</span>
            </div>

            <div style={styles.field}>
                <span style={styles.label}>Type:</span>
                <span style={styles.value}>{asset.type}</span>
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Sensitive:</label>
                <span style={styles.value}>{asset.isSensitive ? 'Yes' : 'No'}</span>
            </div>

            <div style={styles.field}>
                <span style={styles.label}>Description:</span>
                <span style={styles.value}>{asset.description || '—'}</span>
            </div>
        </div>
    )
}

const styles = {
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    field: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-start',
        padding: '0.75rem',
        background: '#f5f5f5',
        borderRadius: '8px',
        wordBreak: 'break-word',
    },
    label: {
        fontWeight: '600',
        color: '#333',
        minWidth: '110px',
        flexShrink: 0,
        textAlign: 'left',
    },
    value: {
        color: '#666',
        fontSize: '0.95rem',
        flex: 1,
        textAlign: 'left',
    },
}
