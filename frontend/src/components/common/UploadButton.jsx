import React, { useRef } from 'react'
import styles from '../../pages/HomeView.module.css'

function UploadButton({ onFileSelect, children }) {
    const fileInputRef = useRef(null)

    const handleClick = () => {
        fileInputRef.current.click()
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            onFileSelect(file)
        }
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
            <button className={styles.button} onClick={handleClick}>
                {children}
            </button>
        </>
    )
}

export default UploadButton
