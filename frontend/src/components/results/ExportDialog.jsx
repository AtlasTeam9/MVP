import React from 'react'

export function ExportDialog({ onFormatSelect, onCancel }) {
    return (
        <div style={styles.overlay} onClick={onCancel}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Seleziona formato di esportazione</h2>
                    <button style={styles.closeBtn} onClick={onCancel}>
                        ✕
                    </button>
                </div>
                <div style={styles.formatButtons}>
                    <button style={styles.formatButton} onClick={() => onFormatSelect('csv')}>
                        CSV
                    </button>
                    <button style={styles.formatButton} onClick={() => onFormatSelect('pdf')}>
                        PDF
                    </button>
                </div>
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
        maxWidth: '400px',
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
        fontSize: '1.1rem',
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
        marginLeft: '1rem',
    },
    formatButtons: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
    },
    formatButton: {
        padding: '0.75rem 1.5rem',
        background: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
}
