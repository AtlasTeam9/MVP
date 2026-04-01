import Device from '@domain/Device'
import Asset from '@domain/Asset'

// Maps the backend session device payload (snake_case) into frontend domain models.
export function createDeviceFromApiResponse(deviceData) {
    const assets = (deviceData.assets || []).map(
        (asset) =>
            new Asset(asset.id, asset.name, asset.type, asset.is_sensitive, asset.description)
    )

    return new Device(
        deviceData.device_name,
        assets,
        deviceData.operating_system,
        deviceData.firmware_version,
        deviceData.functionalities,
        deviceData.description
    )
}

// Transforms backend result objects into the list format expected by the UI and stores.
export function mapResultsToRequirementResults(backendResults = {}) {
    return Object.entries(backendResults).map(([code, status]) => ({ code, status }))
}

export function mapLoadSessionResponse(response = {}) {
    const mappedResults = mapResultsToRequirementResults(response.aggregate_results)

    return {
        sessionId: response.session_id,
        device: createDeviceFromApiResponse(response.device || {}),
        answers: Array.isArray(response.answer) ? response.answer : [],
        position: response.position || null,
        resultsPerAsset: response.results || null,
        results: mappedResults,
        isFinished: Boolean(response.is_finished),
    }
}


