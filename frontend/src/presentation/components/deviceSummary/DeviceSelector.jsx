import React, { useState } from 'react'
import { AssetListView } from '@presentation/components/deviceSummary/AssetListView'
import styles from '@presentation/components/deviceSummary/DeviceSummaryControls.module.css'

// Component to display the device name as a dropdown button. When clicked, it shows the
// list of assets of the device.
export function DeviceSelector({ device }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    return (
        <div className={styles.deviceDropdown}>
            <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-label={`Toggle asset list for ${device.name}`}
            >
                {device.name}
                <span
                    className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.dropdownIconOpen : ''}`}
                >
                    ▶
                </span>
            </button>

            {isDropdownOpen && (
                <AssetListView assets={device.assets || []} showDeleteIcon={false} />
            )}
        </div>
    )
}
