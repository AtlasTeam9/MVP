import React, { useEffect } from 'react'
import styles from './Modal.module.css'

// Generic modal with overlay, close button and basic keyboard accessibility.
export function Modal({ title, onClose, maxWidth = '450px', titleSize = '1.3rem', children }) {
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose?.()
            }
        }

        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])

    const titleId = `${String(title || 'dialog').replace(/\s+/g, '-').toLowerCase()}-title`

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                style={{ maxWidth }}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className={styles.header}>
                    <h2 id={titleId} className={styles.title} style={{ fontSize: titleSize }}>
                        {title}
                    </h2>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close dialog"
                        title="Close dialog"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}
