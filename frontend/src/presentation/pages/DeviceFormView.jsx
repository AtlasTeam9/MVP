import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { deviceSchema } from '@domain/schemas/DeviceSchema'
import { useCurrentDevice } from '@application/hooks/useCurrentDevice'
import deviceService from '@application/services/DeviceService'
import sessionService from '@application/services/SessionService'

import styles from '@presentation/pages/DeviceFormView.module.css'
import Device from '@domain/Device'
import FormPageLayout from '@presentation/components/forms/FormPageLayout'
import InputField from '@presentation/components/forms/fields/InputField'

// Standard form data structure for a Device, used for both creation and editing
const initialData = {
    name: '',
    operatingSystem: '',
    firmwareVersion: '',
    functionalities: '',
    description: '',
}

// Helper function to convert form data into a Device instance
const buildDevice = (data, assets = []) =>
    new Device(
        data.name,
        assets,
        data.operatingSystem,
        data.firmwareVersion,
        data.functionalities,
        data.description
    )

// Custom hook to manage form state and navigation logic
function useDeviceForm() {
    const navigate = useNavigate()
    const currentDevice = useCurrentDevice()

    // Use current device data if available, otherwise use empty initial data
    const formInitialData = currentDevice
        ? {
              name: currentDevice.name,
              operatingSystem: currentDevice.operatingSystem,
              firmwareVersion: currentDevice.firmwareVersion,
              functionalities: currentDevice.functionalities,
              description: currentDevice.description || '',
          }
        : initialData

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(deviceSchema),
        defaultValues: formInitialData,
    })

    const onSave = (data) => {
        const assets = currentDevice ? currentDevice.assets : []
        const dev = buildDevice(data, assets)
        deviceService.createDevice(dev)
        navigate('/device/assets')
    }

    return {
        register,
        handleSubmit: handleSubmit(onSave),
        resetForm: () => reset(),
        errors,
        onCancel: () => {
            deviceService.clearDevice()
            sessionService.clearSession()
            navigate('/')
        },
    }
}

function RequiredFields({ register, errors }) {
    return (
        <>
            <InputField
                label="Name *"
                registration={register('name')}
                error={errors?.name}
                styles={styles}
            />
            <InputField
                label="Operating system *"
                registration={register('operatingSystem')}
                error={errors?.operatingSystem}
                styles={styles}
            />
            <InputField
                label="Firmware version *"
                registration={register('firmwareVersion')}
                error={errors?.firmwareVersion}
                styles={styles}
            />
            <InputField
                label="Functionalities *"
                registration={register('functionalities')}
                error={errors?.functionalities}
                styles={styles}
            />
        </>
    )
}

function OptionalFields({ register }) {
    return (
        <>
            <InputField
                label="Description"
                registration={register('description')}
                isTextArea
                styles={styles}
            />
        </>
    )
}

// Component that combines all form fields
function DeviceFormFields({ register, errors }) {
    return (
        <>
            <RequiredFields register={register} errors={errors} />
            <OptionalFields register={register} />
        </>
    )
}

// Main component for the Device form view, utilizing the custom hook and form field components
export default function DeviceFormView() {
    const { register, handleSubmit, resetForm, onCancel, errors } = useDeviceForm()

    return (
        <FormPageLayout
            onBack={onCancel}
            title="Create a new Device"
            onSubmit={handleSubmit}
            onReset={resetForm}
            styles={styles}
        >
            <DeviceFormFields register={register} errors={errors} />
        </FormPageLayout>
    )
}


