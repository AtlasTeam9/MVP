/* eslint-disable camelcase */
export default class Device {
    constructor(name, assets = [], os, firmware, funcs, desc = null) {
        this.#name = name
        this.#assets = assets
        this.#operatingSystem = os
        this.#firmwareVersion = firmware
        this.#functionalities = funcs
        this.#description = desc
    }

    #name
    #assets
    #operatingSystem
    #firmwareVersion
    #functionalities
    #description

    get name() {
        return this.#name
    }

    get assets() {
        return [...this.#assets]
    }

    get operatingSystem() {
        return this.#operatingSystem
    }

    get firmwareVersion() {
        return this.#firmwareVersion
    }

    get functionalities() {
        return this.#functionalities
    }

    get description() {
        return this.#description || 'Description not inserted'
    }

    addAsset(asset) {
        this.#assets.push(asset)
    }

    deleteAsset(assetId) {
        this.#assets = this.#assets.filter((asset) => asset.id !== assetId)
    }

    toDict() {
        return {
            device_name: this.name,
            assets: this.assets.map((asset) => asset.toDict()),
            operating_system: this.operatingSystem,
            firmware_version: this.firmwareVersion,
            functionalities: this.functionalities,
            description: this.description,
        }
    }
}
