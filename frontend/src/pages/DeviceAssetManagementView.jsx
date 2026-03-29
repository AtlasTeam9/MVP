import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentDevice } from '../services/DeviceService'
import deviceService from '../services/DeviceService'
import sessionService from '../services/SessionService'
import useUIStore from '../store/UIStore'
import NotificationManager from '../infrastructure/notifications/NotificationManager'

import styles from './DeviceAssetManagementView.module.css'
import BackIcon from '../components/common/BackIcon'
import HomeIcon from '../components/common/HomeIcon'

async function createSessionAndNavigate(currentDevice, navigate) {
    if (!currentDevice) return

    try {
        await sessionService.createSessionWithDevice(currentDevice)
        navigate('/device/summary', { state: { fromDeviceAssetManagement: true } })
    } catch (error) {
        NotificationManager.notifyError(error)
    }
}

// Custom hook to manage the logic of the Device Asset Management view
function useAssetManagement() {
    const navigate = useNavigate()
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const currentDevice = useCurrentDevice()

    const proceedToSummary = async () => {
        await createSessionAndNavigate(currentDevice, navigate)
    }

    const onGoToSummary = async () => {
        if (useUIStore.getState().isDirty) {
            setShowUnsavedDialog(true)
            return
        }

        await proceedToSummary()
    }

    const onSaveDevice = () => {
        if (!currentDevice) return

        deviceService.saveDeviceToFile()
    }

    const onConfirmSaveBeforeSummary = async () => {
        onSaveDevice()
        setShowUnsavedDialog(false)
        await proceedToSummary()
    }

    const onConfirmSkipSaveBeforeSummary = async () => {
        setShowUnsavedDialog(false)
        await proceedToSummary()
    }

    const onCancelUnsavedDialog = () => {
        setShowUnsavedDialog(false)
    }

    return {
        currentDevice,
        showUnsavedDialog,
        onAddAsset: () => navigate('/asset/new'),
        onGoToSummary,
        onDeleteAsset: deviceService.removeAsset,
        onSaveDevice,
        onConfirmSaveBeforeSummary,
        onConfirmSkipSaveBeforeSummary,
        onCancelUnsavedDialog,
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
