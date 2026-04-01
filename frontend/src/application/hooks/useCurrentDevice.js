import useDeviceStore from '@state/DeviceStore'
import { selectCurrentDevice } from '@state/selectors/deviceSelectors'

export function useCurrentDevice() {
    return useDeviceStore(selectCurrentDevice)
}

