import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCurrentDevice } from '../services/DeviceService'
import sessionService from '../services/SessionService'
import { DeviceSelector } from '../components/deviceSummary/DeviceSelector'
import { DeviceMainActions } from '../components/deviceSummary/DeviceMainActions'
import { DeviceNavigationIcons } from '../components/deviceSummary/DeviceNavigationIcons'

import BackIcon from '../components/common/BackIcon'
import styles from './DeviceSummaryView.module.css'

// Page to display the summary of a device, including the possibility of viewing its assets.
// It also includes a button for see the device details in an overlay,
// and a button for start the test. There are also the modify and home icons.

export default function DeviceSummaryView() {
    const location = useLocation()
    const navigate = useNavigate()
    const showBackIcon = Boolean(location.state?.fromDeviceAssetManagement)

    const handleBackFromAssetManagement = async () => {
        await sessionService.clearSession()
        navigate('/device/assets')
    }

    // Get the current device from the service
    const currentDevice = useCurrentDevice()

    if (!currentDevice) {
        return <div className={styles.container}>No device loaded</div>
    }

    return (
        <div className={styles.container}>
            {showBackIcon && (
                <BackIcon className={styles.backIcon} onBack={handleBackFromAssetManagement} />
            )}
            <header className={styles.header}>
                <h1>Device Summary</h1>
            </header>

            <DeviceSelector device={currentDevice} />

            <DeviceMainActions device={currentDevice} />

            <DeviceNavigationIcons />
        </div>
    )
}
