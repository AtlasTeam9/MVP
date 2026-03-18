export default class Device {
    constructor(name, assets = [], os = null, firmware = null, funcs = null, desc = null) {
        this._name = name
        this._assets = assets
        this._os = os
        this._firmware = firmware
        this._funcs = funcs
        this._desc = desc
    }

    get name() {
        return this._name
    }

    set name(val) {
        this._name = val
    }

    get assets() {
        return [...this._assets]
    }

    get operativeSystem() {
        return this._os
    }

    get firmwareVersion() {
        return this._firmware
    }

    get functionalities() {
        return this._funcs
    }

    get description() {
        return this._desc || 'Description not inserted'
    }

    toDict() {
        return {
            deviceName: this._name,
            assets: this._assets.map((asset) => asset.toDict()),
            operativeSystem: this.operativeSystem,
            firmwareVersion: this.firmwareVersion,
            functionalities: this.functionalities,
            description: this.description,
        }
    }
}
