import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceInfoOverlay } from '@presentation/components/deviceSummary/DeviceInfoOverlay'
import styles from '@presentation/components/deviceSummary/DeviceSummaryControls.module.css'

export function DeviceMainActions({ device }) {
    const navigate = useNavigate()
    const [showDeviceInfo, setShowDeviceInfo] = useState(false)

    return (
        <>
            <div className={styles.mainActions}>
                <button
                    type="button"
                    onClick={() => setShowDeviceInfo(true)}
                    className={styles.btnPrimary}
                >
                    Show device details
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/session/test')}
                    className={styles.btnSecondary}
                >
                    START TEST
                </button>
            </div>

            {showDeviceInfo && (
                <DeviceInfoOverlay device={device} onClose={() => setShowDeviceInfo(false)} />
            )}
        </>
    )
}
