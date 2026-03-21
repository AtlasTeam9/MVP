import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceInfoOverlay } from './DeviceInfoOverlay'
import styles from '../../pages/DeviceSummaryView.module.css'

export function DeviceMainActions({ device }) {
    const navigate = useNavigate()
    const [showDeviceInfo, setShowDeviceInfo] = useState(false)

    return (
        <>
            <div className={styles.mainActions}>
                <button
                    onClick={() => setShowDeviceInfo(true)}
                    className={styles.btnPrimary}
                >
                    Show device details
                </button>
                <button onClick={() => navigate('/device/test')} className={styles.btnPrimary}>
                    START TEST
                </button>
            </div>

            {showDeviceInfo && (
                <DeviceInfoOverlay device={device} onClose={() => setShowDeviceInfo(false)} />
            )}
        </>
    )
}
