import React, { useRef } from 'react'
import styles from './UploadButton.module.css'

function UploadButton({ onFileSelect, children }) {
    const fileInputRef = useRef(null)

    const handleClick = () => {
        fileInputRef.current.click()
    }

    const handleFileChange = (event) => {
        const input = event.target
        const file = input.files[0]
        if (file) {
            onFileSelect(file)
        }
        // Reset value so selecting the same file again still triggers onChange.
        input.value = ''
    }

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileChange}
                aria-label="Upload device file"
            />
            <button type="button" className={styles.button} onClick={handleClick}>
                {children}
            </button>
        </>
    )
}

export default UploadButton
