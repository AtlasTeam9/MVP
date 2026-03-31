/* eslint-disable camelcase */
export const AssetType = {
    NETWORK_FUNCTION: 'Network Function',
    NETWORK_FUNCTION_CONFIGURATION: 'Network Function Configuration',
    SECURITY_FUNCTION: 'Security Function',
    SECURITY_PARAMETER: 'Security Parameter',

    fromString(value) {
        const val = String(value).trim().toLowerCase()
        if (val.startsWith('network function configuration'))
            return AssetType.NETWORK_FUNCTION_CONFIGURATION
        if (val.startsWith('network function')) return AssetType.NETWORK_FUNCTION
        if (val.startsWith('security function')) return AssetType.SECURITY_FUNCTION
        if (val.startsWith('security parameter')) return AssetType.SECURITY_PARAMETER

        throw new Error(`Unknown asset type: ${value}`)
    },
}

class Asset {
    constructor(id, name, type, isSensitive, desc = null) {
        this._id = id
        this._name = name
        this._type = type
        this._isSensitive = isSensitive
        this._desc = desc
    }

    get id() {
        return this._id
    }
    get name() {
        return this._name
    }
    get type() {
        return this._type
    }
    get isSensitive() {
        return this._isSensitive
    }
    get desc() {
        return this._desc
    }

    toDict() {
        return {
            id: this._id,
            name: this._name,
            type: this._type,
            is_sensitive: this._isSensitive,
            description: this._desc,
        }
    }
}

export default Asset
