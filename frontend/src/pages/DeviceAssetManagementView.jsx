import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentDevice } from '../services/DeviceService'
import deviceService from '../services/DeviceService'
import sessionService from '../services/SessionService'
import styles from './DeviceAssetManagementView.module.css'
import BackIcon from '../components/common/BackIcon'
import HomeIcon from '../components/common/HomeIcon'

// Custom hook to manage the logic of the Device Asset Management view
function useAssetManagement() {
    const navigate = useNavigate()

    // Get the currentDevice from the service
    const currentDevice = useCurrentDevice()

    const onGoToSummary = async () => {
        try {
            const result = await sessionService.createSessionWithDevice(currentDevice)
            console.log('Session created with ID:', result.sessionId) // TODO: rimuovere
            console.log('Device:', result.device) // TODO: rimuovere
            console.log('Position:', result.position) // TODO: rimuovere
            navigate('/device/summary')
        } catch (error) {
            console.error('Failed to create session:', error) // TODO: rimuovere
            // TODO: mostrare messaggio di errore all'utente
        }
    }

    const onSaveDevice = () => {
        if (!currentDevice) return

        console.log('Saving device:', currentDevice) // TODO: rimuovere
        // TODO: implementare chiamata api al backend
    }

    return {
        currentDevice,
        onAddAsset: () => navigate('/asset/new'),
        onGoToSummary,
        onDeleteAsset: deviceService.removeAsset,
        onSaveDevice,
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
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Component for action buttons related to asset management
// (add new asset, go to summary, save device)
function AssetActionButtons({ assets, onAddAsset, onGoToSummary, onSaveDevice }) {
    return (
        <div className={styles.buttonGroup}>
            <button className={styles.btnPrimary} onClick={onAddAsset}>
                Add new asset
            </button>
            {assets && assets.length > 0 && (
                <>
                    <button className={styles.btnSecondary} onClick={onGoToSummary}>
                        Go to summary
                    </button>
                    <button className={styles.btnSecondary} onClick={onSaveDevice}>
                        Save Device
                    </button>
                </>
            )}
        </div>
    )
}

// Main content component for the DeviceAssetManagementView, displaying the header, asset list,
// and action buttons
function DeviceAssetManagementContent({
    currentDevice,
    onAddAsset,
    onGoToSummary,
    onDeleteAsset,
    onSaveDevice,
}) {
    return (
        <div className={styles.container}>
            <BackIcon className={styles.backIcon} />
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1>Device Asset Management</h1>
                    <p className={styles.deviceName}>{currentDevice.name}</p>
                </div>
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
                    onSaveDevice={onSaveDevice}
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
    const { currentDevice, onAddAsset, onGoToSummary, onDeleteAsset, onSaveDevice } =
        useAssetManagement()

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
            onSaveDevice={onSaveDevice}
        />
    )
}
