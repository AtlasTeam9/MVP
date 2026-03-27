import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Icons.module.css'

// BackIcon component that navigates back with optional custom behavior
function BackIcon({ className, onBack }) {
    const navigate = useNavigate()

    const handleBackClick = () => {
        if (onBack) {
            onBack()
        } else {
            navigate('/device/new')
        }
    }

    const buttonClass = className ? `${styles.iconBtn} ${className}` : styles.iconBtn

    return (
        <button className={buttonClass} onClick={handleBackClick} title="Go back">
            ←
        </button>
    )
}

export default BackIcon
