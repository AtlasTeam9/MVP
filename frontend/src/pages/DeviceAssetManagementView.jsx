import React from 'react'

import styles from './DeviceAssetManagementView.module.css'
import BackIcon from '../components/common/BackIcon'
import HomeIcon from '../components/common/HomeIcon'
import { useAssetManagement } from '../hooks/useAssetManagement'

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
                    <div key={asset.id} className={styles.assetItem}>
                        <span className={styles.assetName}>{asset.name}</span>
                        <button
                            className={styles.deleteBtn}
                            onClick={() => onDeleteAsset(asset.id)}
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

function UnsavedChangesDialog({ onConfirmSave, onConfirmSkipSave, onCancel }) {
    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Unsaved changes</h2>
                    <button className={styles.modalCloseBtn} onClick={onCancel}>
                        ✕
                    </button>
                </div>
                <p className={styles.modalText}>
                    There are unsaved changes to the device. Do you want to save before going to
                    the summary?
                </p>
                <div className={styles.modalActions}>
                    <button className={styles.modalButton} onClick={onConfirmSave}>
                        YES
                    </button>
                    <button className={styles.modalButtonSecondary} onClick={onConfirmSkipSave}>
                        NO
                    </button>
                </div>
            </div>
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
    onHome,
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
                <HomeIcon onHome={onHome} />
            </div>
        </div>
    )
}

// Main component for the Device Asset Management view
export default function DeviceAssetManagementView() {
    const {
        currentDevice,
        showUnsavedDialog,
        onAddAsset,
        onGoToSummary,
        onDeleteAsset,
        onSaveDevice,
        onConfirmSaveBeforeSummary,
        onConfirmSkipSaveBeforeSummary,
        onCancelUnsavedDialog,
        onHome,
    } = useAssetManagement()

    if (!currentDevice) {
        return (
            <div className={styles.container}>
                <p>No device loaded. Please create or select a device first.</p>
            </div>
        )
    }

    return (
        <>
            <DeviceAssetManagementContent
                currentDevice={currentDevice}
                onAddAsset={onAddAsset}
                onGoToSummary={onGoToSummary}
                onDeleteAsset={onDeleteAsset}
                onSaveDevice={onSaveDevice}
                onHome={onHome}
            />
            {showUnsavedDialog && (
                <UnsavedChangesDialog
                    onConfirmSave={onConfirmSaveBeforeSummary}
                    onConfirmSkipSave={onConfirmSkipSaveBeforeSummary}
                    onCancel={onCancelUnsavedDialog}
                />
            )}
        </>
    )
}
