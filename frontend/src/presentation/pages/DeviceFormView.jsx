import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { deviceSchema } from '@domain/schemas/DeviceSchema'
import { useCurrentDevice } from '@application/hooks/useCurrentDevice'
import deviceService from '@application/services/DeviceService'
import sessionService from '@application/services/SessionService'

import styles from '@presentation/pages/DeviceFormView.module.css'
import Device from '@domain/Device'
import BackIcon from '@presentation/components/common/BackIcon'

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

// Components for form fields, separated into required and optional for better organization
function InputField({ label, registration, error, isTextArea = false }) {
    const InputTag = isTextArea ? 'textarea' : 'input'
    return (
        <div className={styles.formGroup}>
            <label className={styles.label} htmlFor={registration.name}>
                {label}
            </label>
            <InputTag
                id={registration.name}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                {...registration}
            />
            {error && <span className={styles.errorMessage}>{error.message}</span>}
        </div>
    )
}

function RequiredFields({ register, errors }) {
    return (
        <>
            <InputField label="Name *" registration={register('name')} error={errors?.name} />
            <InputField
                label="Operating system *"
                registration={register('operatingSystem')}
                error={errors?.operatingSystem}
            />
            <InputField
                label="Firmware version *"
                registration={register('firmwareVersion')}
                error={errors?.firmwareVersion}
            />
            <InputField
                label="Functionalities *"
                registration={register('functionalities')}
                error={errors?.functionalities}
            />
        </>
    )
}

function OptionalFields({ register }) {
    return (
        <>
            <InputField label="Description" registration={register('description')} isTextArea />
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
        <>
            <BackIcon onBack={onCancel} />
            <form className={styles.container} onSubmit={handleSubmit}>
                <h2>Create a new Device</h2>

                <DeviceFormFields register={register} errors={errors} />

                <div className={styles.buttonGroup}>
                    <button type="button" className={styles.btnSecondary} onClick={resetForm}>
                        Reset
                    </button>
                    <button type="submit" className={styles.btnPrimary}>
                        Save
                    </button>
                </div>
            </form>
        </>
    )
}


