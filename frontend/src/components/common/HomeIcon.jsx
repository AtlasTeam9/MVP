import React from 'react'
import { useNavigate } from 'react-router-dom'
import deviceService from '../../services/DeviceService'
import sessionService from '../../services/SessionService'
import styles from '../../pages/DeviceSummaryView.module.css'

// Simple HomeIcon component that navigates to the home page and clears the device
function HomeIcon() {
    const navigate = useNavigate()

    const handleHomeClick = () => {
        deviceService.clearDevice()
        sessionService.clearSession()
        navigate('/')
    }

    return (
        <button className={styles.iconBtn} onClick={handleHomeClick} title="Return to Homepage">
            🏠
        </button>
    )
}

export default HomeIcon
