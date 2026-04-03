import React from 'react'
import { DeviceInfo } from '@presentation/components/deviceSummary/DeviceInfo'
import { Modal } from '@presentation/components/common/Modal'

// Component to display an overlay when device details are requested in the device summary view.
export function DeviceInfoOverlay({ device, onClose }) {
    return (
        <Modal title="Device details" onClose={onClose} maxWidth="550px" titleSize="1.3rem">
            <DeviceInfo device={device} />
        </Modal>
    )
}
