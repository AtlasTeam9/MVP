import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { deviceSchema } from '../domain/schemas/DeviceSchema'

import styles from './DeviceFormView.module.css'
import Device from '../domain/Device'

// Standard form data structure for a Device, used for both creation and editing
const initialData = {
    name: '',
    operatingSystem: '',
    firmwareVersion: '',
    functionality: '',
    description: '',
}

// Helper function to convert form data into a Device instance
const buildDevice = (data) =>
    new Device(
        data.name,
        [],
        data.operatingSystem,
        data.firmwareVersion,
        data.functionality,
        data.description
    )

// Custom hook to manage form state and navigation logic
function useDeviceForm() {
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(deviceSchema),
        defaultValues: initialData,
    })

    const onSave = (data) => {
        const dev = buildDevice(data)
        console.log('Salvato con Zod:', dev.toDict()) //TODO: da eliminare, è solo per testare
        navigate('/') // TODO: sostituire con logica salvataggio
    }

    return {
        register,
        handleSubmit: handleSubmit(onSave),
        resetForm: () => reset(),
        errors,
        onCancel: () => navigate('/'),
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
            <InputField label="Nome *" registration={register('name')} error={errors?.name} />
            <InputField
                label="OS *"
                registration={register('operatingSystem')}
                error={errors?.operatingSystem}
            />
            <InputField
                label="Firmware *"
                registration={register('firmwareVersion')}
                error={errors?.firmwareVersion}
            />
            <InputField
                label="Functionality *"
                registration={register('functionality')}
                error={errors?.functionality}
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
        <form className={styles.container} onSubmit={handleSubmit}>
            <h2>Create a new Device</h2>

            <DeviceFormFields register={register} errors={errors} />

            <div className={styles.buttonGroup}>
                <button type="button" className={styles.btnSecondary} onClick={onCancel}>
                    Cancel
                </button>
                <button type="button" className={styles.btnSecondary} onClick={resetForm}>
                    Reset
                </button>
                <button type="submit" className={styles.btnPrimary}>
                    Save
                </button>
            </div>
        </form>
    )
}
