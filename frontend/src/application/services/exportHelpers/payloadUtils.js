import StateError from '@application/errors/StateError'

export function isEmptyPayload(payload) {
    if (payload === null || payload === undefined) {
        return true
    }

    if (payload instanceof Blob) {
        return payload.size === 0
    }

    if (typeof payload === 'string') {
        return payload.length === 0
    }

    if (payload instanceof ArrayBuffer) {
        return payload.byteLength === 0
    }

    if (ArrayBuffer.isView(payload)) {
        return payload.byteLength === 0
    }

    return false
}

export function ensureNonEmptyExportPayload(payload, format) {
    if (!isEmptyPayload(payload)) {
        return
    }

    throw new StateError('Il server ha ritornato una risposta vuota.', {
        code: 'EXPORT_EMPTY_RESPONSE',
        context: { format },
    })
}

export function toBlob(payload, mimeType) {
    if (payload instanceof Blob) {
        return payload
    }

    if (typeof payload === 'string') {
        return new Blob([payload], { type: mimeType })
    }

    if (payload instanceof ArrayBuffer || ArrayBuffer.isView(payload)) {
        return new Blob([payload], { type: mimeType })
    }

    return new Blob([JSON.stringify(payload, null, 2)], { type: mimeType })
}