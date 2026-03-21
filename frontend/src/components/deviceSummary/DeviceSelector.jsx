import React, { useState } from 'react'
import { AssetListView } from './AssetListView'
import styles from '../../pages/DeviceSummaryView.module.css'

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
