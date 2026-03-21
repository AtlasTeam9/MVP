import React, { useState } from 'react'
import { AssetListView } from './AssetListView'
import styles from '../../pages/DeviceSummaryView.module.css'

// Component to display the device name as a dropdown button. When clicked, it shows the
// list of assets of the device.
export function DeviceSelector({ device }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    return (
        <div className={styles.deviceDropdown}>
            <button
                className={styles.dropdownButton}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                {device.name}
                <span
                    className={styles.dropdownIcon}
                    style={{ transform: isDropdownOpen ? 'rotate(90deg)' : 'none' }}
                >
                    ▶
                </span>
            </button>

            {isDropdownOpen && (
                <AssetListView
                    assets={device.assets || []}
                    isEditable={false}
                    showDeleteIcon={false}
                />
            )}
        </div>
    )
}
