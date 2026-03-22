import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentDevice } from '../services/DeviceService'
import deviceService from '../services/DeviceService'
import styles from './DeviceAssetManagementView.module.css'
import HomeIcon from '../components/common/HomeIcon'

// Custom hook to manage the logic of the Device Asset Management view
function useAssetManagement() {
    const navigate = useNavigate()

    // Get the currentDevice from the service
    const currentDevice = useCurrentDevice()

    return {
        currentDevice,
        onAddAsset: () => navigate('/asset/new'),
        onGoToSummary: () => navigate('/device/summary'),
        onDeleteAsset: deviceService.removeAsset,
    }
}

// Component to display the list of assets for the current device
function AssetListDisplay({ assets, onDeleteAsset }) {
    if (!assets || assets.length === 0) {
        return (
            <div className={styles.emptyAssets}>
                <p>No assets added yet</p>
            </div>
        )
    }

    return (
        <div className={styles.assetListDisplay}>
            <h4 className={styles.assetListTitle}>Assets ({assets.length})</h4>
            <div className={styles.assetItems}>
                {assets.map((asset) => (
                    <div key={asset.name} className={styles.assetItem}>
                        <span className={styles.assetName}>{asset.name}</span>
                        <button
                            className={styles.deleteBtn}
                            onClick={() => onDeleteAsset(asset.name)}
                            title="Delete asset"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Component for action buttons related to asset management (add new asset, go to summary)
function AssetActionButtons({ assets, onAddAsset, onGoToSummary }) {
    return (
        <div className={styles.buttonGroup}>
            <button className={styles.btnPrimary} onClick={onAddAsset}>
                Add new asset
            </button>
            {assets && assets.length > 0 && (
                <button className={styles.btnSecondary} onClick={onGoToSummary}>
                    Go to summary
                </button>
            )}
        </div>
    )
}

// Main content component for the DeviceAssetManagementView, displaying the header, asset list,
// and action buttons
function DeviceAssetManagementContent({ currentDevice, onAddAsset, onGoToSummary, onDeleteAsset }) {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Device Asset Management</h1>
                <p className={styles.deviceName}>{currentDevice.name}</p>
            </header>
            <div className={styles.content}>
                <div className={styles.assetSection}>
                    <AssetListDisplay
                        assets={currentDevice.assets || []}
                        onDeleteAsset={onDeleteAsset}
                    />
                </div>
                <AssetActionButtons
                    assets={currentDevice.assets}
                    onAddAsset={onAddAsset}
                    onGoToSummary={onGoToSummary}
                />
            </div>
            <div className={styles.navigationIcons}>
                <HomeIcon />
            </div>
        </div>
    )
}

// Main component for the Device Asset Management view
export default function DeviceAssetManagementView() {
    const { currentDevice, onAddAsset, onGoToSummary, onDeleteAsset } = useAssetManagement()

    if (!currentDevice) {
        return (
            <div className={styles.container}>
                <p>No device loaded. Please create or select a device first.</p>
            </div>
        )
    }

    return (
        <DeviceAssetManagementContent
            currentDevice={currentDevice}
            onAddAsset={onAddAsset}
            onGoToSummary={onGoToSummary}
            onDeleteAsset={onDeleteAsset}
        />
    )
}
