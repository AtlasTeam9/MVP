import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentDevice } from '../services/DeviceService'
import deviceService from '../services/DeviceService'
import sessionService from '../services/SessionService'
import useUIStore from '../store/UIStore'
import NotificationManager from '../infrastructure/notifications/NotificationManager'

async function createSessionAndNavigate(currentDevice, navigate) {
    if (!currentDevice) return

    try {
        await sessionService.createSessionWithDevice(currentDevice)
        navigate('/device/summary', { state: { fromDeviceAssetManagement: true } })
    } catch (error) {
        NotificationManager.notifyError(error)
    }
}

export function useAssetManagement() {
    const navigate = useNavigate()
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const currentDevice = useCurrentDevice()
    const isDirty = useUIStore((state) => state.isDirty)

    const proceedToSummary = async () => {
        await createSessionAndNavigate(currentDevice, navigate)
    }

    const onGoToSummary = async () => {
        if (isDirty) {
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

    const onHome = async () => {
        deviceService.clearDevice()
        await sessionService.clearSession()
        navigate('/')
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
        onHome,
    }
}
