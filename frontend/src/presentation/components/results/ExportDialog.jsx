import React from 'react'
import { Modal } from '@presentation/components/common/Modal'
import styles from '@presentation/components/results/ExportDialog.module.css'

export function ExportDialog({ onFormatSelect, onCancel }) {
    return (
        <Modal title="Select export format" onClose={onCancel} maxWidth="400px" titleSize="1.1rem">
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
