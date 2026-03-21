import { AssetItemView } from './AssetItemView'

// Component to display the list of assets of a device in the dropdown when the device name is
// clicked in the device summary view.
export function AssetListView({
    assets,
    isEditable = false,
    showDeleteIcon = false,
    onDeleteAsset,
}) {
    return (
        <div style={styles.assetListContainer}>
            <h4 style={styles.assetListTitle}>Assets ({assets?.length || 0})</h4>
            <div style={styles.assetList}>
                {assets?.map((asset) => (
                    <AssetItemView
                        key={asset.id}
                        asset={asset}
                        showDeleteIcon={showDeleteIcon && isEditable}
                        onDelete={onDeleteAsset}
                    />
                ))}
            </div>
        </div>
    )
}

const styles = {
    assetListContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 100,
        marginTop: '4px',
        background: 'white',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
        maxHeight: '320px',
        overflowY: 'auto',
    },
    assetListTitle: {
        margin: '0 0 0.75rem 0',
        color: '#333',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    assetList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    assetListItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem',
        borderBottom: '1px solid #f0f0f0',
    },
    assetName: {
        color: '#333',
        fontWeight: '500',
    },
    assetType: {
        color: '#007bff',
        fontSize: '0.85rem',
        fontWeight: '600',
    },
}
