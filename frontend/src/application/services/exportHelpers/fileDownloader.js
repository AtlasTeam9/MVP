import { toBlob } from '@application/services/exportHelpers/payloadUtils'

export function downloadFile(payload, filename, mimeType = 'application/json') {
    const blob = toBlob(payload, mimeType)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
}