export default function ToggleSwitch({ registration, label, styles }) {
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
