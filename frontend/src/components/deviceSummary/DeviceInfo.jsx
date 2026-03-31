import React from 'react'
import styles from './InfoPanels.module.css'

// Component to display device information in the overlay when device details are shown
// in the device summary view.
export function DeviceInfo({ device }) {
    return (
        <div className={styles.content}>
            <div className={`${styles.fieldBase} ${styles.deviceField}`}>
                <span className={`${styles.labelBase} ${styles.deviceLabel}`}>Name:</span>
                <span className={styles.value}>{device.name}</span>
            </div>

            <div className={`${styles.fieldBase} ${styles.deviceField}`}>
                <span className={`${styles.labelBase} ${styles.deviceLabel}`}>
                    Operating system:
                </span>
                <span className={styles.value}>{device.operatingSystem}</span>
            </div>

            <div className={`${styles.fieldBase} ${styles.deviceField}`}>
                <span className={`${styles.labelBase} ${styles.deviceLabel}`}>
                    Firmware version:
                </span>
                <span className={styles.value}>{device.firmwareVersion}</span>
            </div>

            <div className={`${styles.fieldBase} ${styles.deviceField}`}>
                <span className={`${styles.labelBase} ${styles.deviceLabel}`}>
                    Functionalities:
                </span>
                <span className={styles.value}>{device.functionalities}</span>
            </div>

            <div className={`${styles.fieldBase} ${styles.deviceField}`}>
                <span className={`${styles.labelBase} ${styles.deviceLabel}`}>
                    Description:
                </span>
                <span className={styles.value}>{device.description || '—'}</span>
            </div>
        </div>
    )
}
