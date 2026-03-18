import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './DeviceFormView.module.css'
import Device from '../domain/Device'

const validateData = (formData) => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Il nome è obbligatorio'
    if (!formData.functionality.trim()) newErrors.functionality = 'Obbligatorio'
    return newErrors
}

// const createDeviceInstance = (formData) => {
//     return new Device(
//         formData.name,
//         [], // assets list
//         formData.operatingSystem,
//         formData.firmwareVersion,
//         formData.functionality,
//         formData.description
//     )
// }

// --- 2. CUSTOM HOOK ---

function useDeviceForm() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ name: '', functionality: '', operatingSystem: '' })
    const [errors, setErrors] = useState({})

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    const onSave = () => {
        const newErrors = validateData(formData)
        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {
            // const nuovoDispositivo = createDeviceInstance(formData)
            navigate('/')
        }
    }

    return { formData, errors, handleChange, onSave, onCancel: () => navigate('/') }
}

// ==========================================
// 2. COMPONENTE UI (Grafica riutilizzabile)
// ==========================================
function InputField({ label, value, onChange, error, placeholder }) {
    return (
        <div className={styles.formGroup}>
            <label className={styles.label}>{label}</label>
            <input
                type="text"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                value={value}
                onChange={(val) => onChange(val.target.value)}
                placeholder={placeholder}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    )
}

// ==========================================
// 3. SOTTO-COMPONENTE PER I CAMPI DEL FORM
// ==========================================
function DeviceFields({ formData, errors, handleChange }) {
    return (
        <>
            <InputField
                label="Nome Dispositivo *"
                value={formData.name}
                onChange={(val) => handleChange('name', val)}
                error={errors.name}
                placeholder="Es. Sensore A1"
            />
            <InputField
                label="Funzionalità *"
                value={formData.functionality}
                onChange={(val) => handleChange('functionality', val)}
                error={errors.functionality}
                placeholder="Es. Temperatura"
            />
            <InputField
                label="Sistema Operativo"
                value={formData.operatingSystem}
                onChange={(val) => handleChange('operatingSystem', val)}
                placeholder="Es. FreeRTOS"
            />
        </>
    )
}

// ==========================================
// 4. LA VISTA PRINCIPALE
// ==========================================
export default function DeviceFormView() {
    const { formData, errors, handleChange, onSave, onCancel } = useDeviceForm()

    return (
        <div className={styles.container}>
            <h2>Crea Nuovo Dispositivo</h2>

            <DeviceFields formData={formData} errors={errors} handleChange={handleChange} />

            <div className={styles.buttonGroup}>
                <button className={`${styles.button} ${styles.btnSecondary}`} onClick={onCancel}>
                    Annulla
                </button>
                <button className={`${styles.button} ${styles.btnPrimary}`} onClick={onSave}>
                    Salva Dispositivo
                </button>
            </div>
        </div>
    )
}
