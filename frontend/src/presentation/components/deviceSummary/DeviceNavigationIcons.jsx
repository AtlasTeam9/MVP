import HomeIcon from '@presentation/components/common/HomeIcon'
import styles from '@presentation/components/deviceSummary/DeviceSummaryControls.module.css'

export function DeviceNavigationIcons({ onHome }) {
    return (
        <div className={styles.navigationIcons}>
            <HomeIcon onHome={onHome} />
        </div>
    )
}
