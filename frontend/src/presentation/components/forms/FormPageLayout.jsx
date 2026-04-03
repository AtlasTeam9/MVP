import BackIcon from '@presentation/components/common/BackIcon'

export default function FormPageLayout({
    onBack,
    title,
    onSubmit,
    children,
    onReset,
    resetLabel = 'Reset',
    submitLabel = 'Save',
    styles,
}) {
    return (
        <>
            <BackIcon onBack={onBack} />
            <form className={styles.container} onSubmit={onSubmit}>
                <h2>{title}</h2>
                {children}
                <div className={styles.buttonGroup}>
                    <button type="button" className={styles.btnSecondary} onClick={onReset}>
                        {resetLabel}
                    </button>
                    <button type="submit" className={styles.btnPrimary}>
                        {submitLabel}
                    </button>
                </div>
            </form>
        </>
    )
}
