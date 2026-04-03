export default function SelectField({ label, registration, error, options, styles }) {
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
