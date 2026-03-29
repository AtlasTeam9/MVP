/* eslint-disable camelcase */
export default class Device {
    constructor(name, assets = [], os, firmware, funcs, desc = null) {
        this._name = name
        this._assets = assets
        this._operatingSystem = os
        this._firmwareVersion = firmware
        this._functionalities = funcs
        this._description = desc
    }

    get name() {
        return this._name
    }

    get assets() {
        return [...this._assets]
    }

    get operatingSystem() {
        return this._operatingSystem
    }

    get firmwareVersion() {
        return this._firmwareVersion
    }

    get functionalities() {
        return this._functionalities
    }

    get description() {
        return this._description || 'Description not inserted'
    }

    addAsset(asset) {
        this._assets.push(asset)
    }

    deleteAsset(assetId) {
        this._assets = this._assets.filter((asset) => asset.id !== assetId)
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
