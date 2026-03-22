export const AssetType = {
    NETWORK_FUN: "Network function",
    NETWORK_FUN_CONFIG: "Network function configuration",
    SECURITY_FUN: "Security function",
    SECURITY_PARAM: "Security parameter",

    fromString(value) {
        const val = value.toLowerCase()

        for (const key in this) {
            if (typeof this[key] === "string" &&
                this[key].toLowerCase() === val) {
                return this[key]
            }
        }

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
            isSensitive: this._isSensitive,
            desc: this._desc,
        }
    }
}

export default Asset
