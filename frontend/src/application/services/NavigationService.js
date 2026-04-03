import deviceService from '@application/services/DeviceService'
import sessionService from '@application/services/SessionService'

export async function resetSessionAndNavigateHome(navigate) {
    deviceService.clearDevice()
    await sessionService.clearSession()
    navigate('/')
}
