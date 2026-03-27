import HomeIcon from '../common/HomeIcon'
import EditIcon from '../common/EditIcon'
import styles from '../../pages/DeviceSummaryView.module.css'

export function DeviceNavigationIcons() {
    return (
        <div className={styles.navigationIcons}>
            <EditIcon />
            <HomeIcon />
        </div>
    )
}
