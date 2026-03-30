import React from 'react'
import { Modal } from '../common/Modal'
import styles from './ExportDialog.module.css'

export function ExportDialog({ onFormatSelect, onCancel }) {
    return (
        <Modal
            title="Seleziona formato di esportazione"
            onClose={onCancel}
            maxWidth="400px"
            titleSize="1.1rem"
        >
            <div className={styles.formatButtons}>
                <button
                    type="button"
                    className={styles.formatButton}
                    onClick={() => onFormatSelect('csv')}
                    aria-label="Export as CSV"
                >
                    CSV
                </button>
                <button
                    type="button"
                    className={styles.formatButton}
                    onClick={() => onFormatSelect('pdf')}
                    aria-label="Export as PDF"
                >
                    PDF
                </button>
            </div>
        </Modal>
    )
}
