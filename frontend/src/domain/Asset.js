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
        this.#id = id
        this.#name = name
        this.#type = type
        this.#isSensitive = isSensitive
        this.#desc = desc
    }

    #id
    #name
    #type
    #isSensitive
    #desc

    get id() {
        return this.#id
    }
    get name() {
        return this.#name
    }
    get type() {
        return this.#type
    }
    get isSensitive() {
        return this.#isSensitive
    }
    get desc() {
        return this.#desc
    }

    toDict() {
        return {
            id: this.#id,
            name: this.#name,
            type: this.#type,
            is_sensitive: this.#isSensitive,
            description: this.#desc,
        }
    }
}

export default Asset
