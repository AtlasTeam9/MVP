import ToggleSwitch from '@presentation/components/forms/fields/ToggleSwitch'

export default function CheckboxField({ label, registration, error, styles }) {
    return (
        <div className={styles.formGroup}>
            <ToggleSwitch registration={registration} label={label} styles={styles} />
            {error && <span className={styles.errorMessage}>{error.message}</span>}
        </div>
    )
}
