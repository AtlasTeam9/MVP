import React from 'react'
import { AssetInfo } from './AssetInfo'
import { Modal } from '../common/Modal'

// Component to display an overlay when an asset is selected in the device summary view.
export function AssetInfoOverlay({ asset, onClose }) {
    return (
        <Modal title="Asset details" onClose={onClose} maxWidth="450px" titleSize="1.3rem">
            <AssetInfo asset={asset} />
        </Modal>
    )
}
