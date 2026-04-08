export default function InputField({ label, registration, error, isTextArea = false, styles }) {
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
