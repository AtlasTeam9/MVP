export const AssetType = {
    NETWORK: 'Network',
    SECURITY: 'Security',

    fromString(value) {
        const val = value.toLowerCase()
        if (val.startsWith('network')) return AssetType.NETWORK
        if (val.startsWith('security')) return AssetType.SECURITY
        throw new Error(`Unknown asset type: ${value}`)
    },
}

class Asset {
    constructor(id, name, type, isSensitive = null, desc = null) {
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
    set name(val) {
        this._name = val
    }

    toDict() {
        return {
            id: this._id,
            name: this._name,
            type: this._type,
            isSensitive: this._isSensitive,
            desc: this._desc,
        }
    }
}
