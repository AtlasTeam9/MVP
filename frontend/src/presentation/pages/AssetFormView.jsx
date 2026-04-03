import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { assetSchema } from '@domain/schemas/AssetSchema'
import Asset, { AssetType } from '@domain/Asset'
import deviceService from '@application/services/DeviceService'

import styles from '@presentation/pages/DeviceFormView.module.css'
import FormPageLayout from '@presentation/components/forms/FormPageLayout'
import InputField from '@presentation/components/forms/fields/InputField'
import SelectField from '@presentation/components/forms/fields/SelectField'
import CheckboxField from '@presentation/components/forms/fields/CheckboxField'

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
            <InputField
                label="Name *"
                registration={register('name')}
                error={errors?.name}
                styles={styles}
            />
            <SelectField
                label="Type *"
                registration={register('type')}
                error={errors?.type}
                options={assetTypeOptions}
                styles={styles}
            />
            <CheckboxField
                label="Is Sensitive *"
                registration={register('isSensitive')}
                error={errors?.isSensitive}
                styles={styles}
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
                styles={styles}
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
        <FormPageLayout
            onBack={onCancel}
            title="Add New Asset"
            onSubmit={handleSubmit}
            onReset={resetForm}
            styles={styles}
        >
            <AssetFormFields register={register} errors={errors} />
        </FormPageLayout>
    )
}


