import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Icons.module.css'
import homeIcon from '../../assets/icons/home.png'

// Reusable home icon with optional custom action.
function HomeIcon({ onHome, className }) {
    const navigate = useNavigate()

    const handleHomeClick = async () => {
        if (onHome) {
            await onHome()
            return
        }
        navigate('/')
    }

    const buttonClass = className ? `${styles.iconBtn} ${className}` : styles.iconBtn

    return (
        <button
            type="button"
            className={buttonClass}
            onClick={handleHomeClick}
            title="Return to homepage"
            aria-label="Return to homepage"
        >
            <img src={homeIcon} alt="" className={styles.iconImage} aria-hidden="true" />
        </button>
    )
}

export default HomeIcon
