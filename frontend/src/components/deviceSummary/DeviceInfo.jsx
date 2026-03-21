import React from 'react'

// Component to display device information in the overlay when device details are shown
// in the device summary view.
export function DeviceInfo({ device }) {
    return (
        <div style={styles.content}>
            <div style={styles.field}>
                <span style={styles.label}>Name:</span>
                <span style={styles.value}>{device.name}</span>
            </div>

            <div style={styles.field}>
                <span style={styles.label}>Operating system:</span>
                <span style={styles.value}>{device.operatingSystem}</span>
            </div>

            <div style={styles.field}>
                <span style={styles.label}>Firmware version:</span>
                <span style={styles.value}>{device.firmwareVersion}</span>
            </div>

            <div style={styles.field}>
                <span style={styles.label}>Functionalities:</span>
                <span style={styles.value}>{device.functionalities}</span>
            </div>

            <div style={styles.field}>
                <span style={styles.label}>Description:</span>
                <span style={styles.value}>{device.description || '—'}</span>
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
        gap: '1.5rem',
        alignItems: 'flex-start',
        padding: '0.75rem',
        background: '#f5f5f5',
        borderRadius: '8px',
        wordBreak: 'break-word',
    },
    label: {
        fontWeight: '600',
        color: '#333',
        minWidth: '160px',
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
