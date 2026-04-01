import { AssetItemView } from '@presentation/components/deviceSummary/AssetItemView'
import styles from '@presentation/components/deviceSummary/AssetListView.module.css'

// Component to display the list of assets of a device in the dropdown when the device name is
// clicked in the device summary view.
export function AssetListView({ assets, showDeleteIcon = false, onDeleteAsset }) {
    return (
        <div className={styles.assetListContainer}>
            <h4 className={styles.assetListTitle}>Assets ({assets?.length || 0})</h4>
            <div className={styles.assetList}>
                {assets?.map((asset) => (
                    <AssetItemView
                        key={asset.id}
                        asset={asset}
                        showDeleteIcon={showDeleteIcon}
                        onDelete={onDeleteAsset}
                    />
                ))}
            </div>
        </div>
    )
}
