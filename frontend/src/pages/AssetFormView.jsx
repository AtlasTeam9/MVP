import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { assetSchema } from '../domain/schemas/AssetSchema'
import Asset, { AssetType } from '../domain/Asset'
import deviceService from '../services/DeviceService'

import styles from './DeviceFormView.module.css'
import BackIcon from '../components/common/BackIcon'

// Standard form data structure for an Asset
const initialData = {
    name: '',
    type: '',
    isSensitive: false,
    desc: '',
}

// Helper function to convert form data into an Asset instance
const buildAsset = (data) => {
    const id = Date.now().toString() // Generate a simple unique ID
    return new Asset(id, data.name, data.type, data.isSensitive, data.desc || null)
}

// Custom hook to manage form state and navigation logic for assets
function useAssetForm() {
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(assetSchema),
        defaultValues: initialData,
    })

    const onSave = (data) => {
        const createdAsset = buildAsset(data)
        deviceService.addAssetToDevice(createdAsset)

        navigate('/device/assets')
    }

    return {
        register,
        handleSubmit: handleSubmit(onSave),
        resetForm: () => reset(),
        errors,
        onCancel: () => navigate('/device/assets'),
    }
}

// Component for iOS-style toggle switch used for the "Is Sensitive" field
function ToggleSwitch({ registration, label }) {
    const inputId = registration.name

    return (
        <div className={styles.toggleContainer}>
            <label className={styles.toggleLabel} htmlFor={inputId}>
                {label}
            </label>
            <label className={styles.toggleSwitch}>
                <input id={inputId} type="checkbox" {...registration} />
                <span className={styles.toggleSlider}></span>
            </label>
        </div>
    )
}

// Component for select fields (Asset "Type" field)
function SelectField({ label, registration, error, options }) {
    return (
        <div className={styles.formGroup}>
            <label className={styles.label} htmlFor={registration.name}>
                {label}
            </label>
            <select
                id={registration.name}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                {...registration}
            >
                <option value="">Select a type...</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className={styles.errorMessage}>{error.message}</span>}
        </div>
    )
}

// Component for checkbox fields with toggle ("IsSensitive" field)
function CheckboxField({ label, registration, error }) {
    return (
        <div className={styles.formGroup}>
            <ToggleSwitch registration={registration} label={label} />
            {error && <span className={styles.errorMessage}>{error.message}</span>}
        </div>
    )
}

// Component for text and textarea input fields ("Name" and "Description" fields)
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
    const assetTypeOptions = [
        { value: AssetType.NETWORK_FUNCTION, label: AssetType.NETWORK_FUNCTION },
        {
            value: AssetType.NETWORK_FUNCTION_CONFIGURATION,
            label: AssetType.NETWORK_FUNCTION_CONFIGURATION,
        },
        { value: AssetType.SECURITY_FUNCTION, label: AssetType.SECURITY_FUNCTION },
        { value: AssetType.SECURITY_PARAMETER, label: AssetType.SECURITY_PARAMETER },
    ]

    return (
        <>
            <InputField label="Name *" registration={register('name')} error={errors?.name} />
            <SelectField
                label="Type *"
                registration={register('type')}
                error={errors?.type}
                options={assetTypeOptions}
            />
            <CheckboxField
                label="Is Sensitive *"
                registration={register('isSensitive')}
                error={errors?.isSensitive}
            />
        </>
    )
}

function OptionalFields({ register, errors }) {
    return (
        <>
            <InputField
                label="Description"
                registration={register('desc')}
                isTextArea
                error={errors?.desc}
            />
        </>
    )
}

// Component that combines all form fields
function AssetFormFields({ register, errors }) {
    return (
        <>
            <RequiredFields register={register} errors={errors} />
            <OptionalFields register={register} errors={errors} />
        </>
    )
}

// Main component for the Asset form view
export default function AssetFormView() {
    const { register, handleSubmit, resetForm, onCancel, errors } = useAssetForm()

    return (
        <>
            <BackIcon onBack={onCancel} />
            <form className={styles.container} onSubmit={handleSubmit}>
                <h2>Add New Asset</h2>

                <AssetFormFields register={register} errors={errors} />

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
