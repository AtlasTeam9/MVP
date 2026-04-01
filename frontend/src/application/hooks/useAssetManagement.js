import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentDevice } from '@application/hooks/useCurrentDevice'
import deviceService from '@application/services/DeviceService'
import sessionService from '@application/services/SessionService'
import { resetSessionAndNavigateHome } from '@application/services/NavigationService'
import useUIStore from '@state/UIStore'
import { selectIsDirty } from '@state/selectors/uiSelectors'
import { notificationService } from '@application/services/AppServices'

async function createSessionAndNavigate(currentDevice, navigate) {
    if (!currentDevice) return

    try {
        await sessionService.createSessionWithDevice(currentDevice)
        navigate('/device/summary', { state: { fromDeviceAssetManagement: true } })
    } catch (error) {
        notificationService.notifyError(error)
    }
}

export function useAssetManagement() {
    const navigate = useNavigate()
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const currentDevice = useCurrentDevice()
    const isDirty = useUIStore(selectIsDirty)

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
        await resetSessionAndNavigateHome(navigate)
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


