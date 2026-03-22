import React from 'react'
import { useNavigate } from 'react-router-dom'
import deviceService from '../../services/DeviceService'
import styles from '../../pages/DeviceSummaryView.module.css'

// Simple HomeIcon component that navigates to the home page and clears the device
function HomeIcon() {
    const navigate = useNavigate()

    const handleHomeClick = () => {
        deviceService.clearDevice()
        navigate('/')
    }

    return (
        <button className={styles.iconBtn} onClick={handleHomeClick} title="Home">
            🏠
        </button>
    )
}

export default HomeIcon
