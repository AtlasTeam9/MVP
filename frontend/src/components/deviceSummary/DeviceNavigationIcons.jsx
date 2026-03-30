import HomeIcon from '../common/HomeIcon'
import styles from './DeviceSummaryControls.module.css'

export function DeviceNavigationIcons({ onHome }) {
    return (
        <div className={styles.navigationIcons}>
            <HomeIcon onHome={onHome} />
        </div>
    )
}
