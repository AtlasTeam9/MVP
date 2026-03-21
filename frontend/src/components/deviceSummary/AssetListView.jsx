import { AssetItemView } from './AssetItemView'

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
        marginTop: '0.75rem',
        background: 'white',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
