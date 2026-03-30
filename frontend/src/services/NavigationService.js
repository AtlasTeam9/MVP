import deviceService from './DeviceService'
import sessionService from './SessionService'

export async function resetSessionAndNavigateHome(navigate) {
    deviceService.clearDevice()
    await sessionService.clearSession()
    navigate('/')
}
