export function hasNotApplicableDependency(assetResultsObj, dependencies) {
    return dependencies?.some((depId) => assetResultsObj?.[depId] === 'NOT_APPLICABLE')
}

export function isAssetClickable(status, assetResultsObj, dependencies) {
    if (!dependencies || dependencies.length === 0) {
        return true
    }

    if (status === 'NOT_APPLICABLE') {
        return false
    }

    return !hasNotApplicableDependency(assetResultsObj, dependencies)
}

export function getAssetStatus(assetId, requirementId, resultsPerAsset) {
    return resultsPerAsset?.[assetId]?.[requirementId] || 'NOT_COMPLETED'
}

export function getAssetStatusClass(status, styles) {
    switch (status) {
        case 'PASS':
            return styles.statusPass
        case 'FAIL':
            return styles.statusFail
        case 'NOT_APPLICABLE':
            return styles.statusNotApplicable
        case 'NOT_COMPLETED':
            return styles.statusNotCompleted
        default:
            return ''
    }
}