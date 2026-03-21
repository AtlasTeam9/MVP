import React from 'react'
import useDeviceStore from '../store/DeviceStore'
import { DeviceSelector } from '../components/deviceSummary/DeviceSelector'
import { DeviceMainActions } from '../components/deviceSummary/DeviceMainActions'
import { DeviceNavigationIcons } from '../components/deviceSummary/DeviceNavigationIcons'
import styles from './DeviceSummaryView.module.css'

export default function DeviceSummaryView() {
    const currentDevice = useDeviceStore((state) => state.currentDevice)

    if (!currentDevice) {
        return <div className={styles.container}>No device loaded</div>
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Device Summary</h1>
            </header>

            <DeviceSelector device={currentDevice} />

            <DeviceMainActions />

            <DeviceNavigationIcons />
        </div>
    )
}
