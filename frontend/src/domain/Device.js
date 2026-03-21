export default class Device {
    constructor(name, assets = [], os, firmware, funcs, desc = null) {
        this._name = name
        this._assets = assets
        this._operatingSystem = os
        this._firmwareVersion = firmware
        this._functionality = funcs
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
        return this._functionality
    }

    get description() {
        return this._description || 'Description not inserted'
    }

    toDict() {
        return {
            deviceName: this.name,
            assets: this.assets.map((asset) => asset.toDict()),
            operatingSystem: this.operatingSystem,
            firmwareVersion: this.firmwareVersion,
            functionalities: this.functionalities,
            description: this.description,
        }
    }
}
