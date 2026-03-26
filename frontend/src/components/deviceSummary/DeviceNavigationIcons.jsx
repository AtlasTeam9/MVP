import { useNavigate } from 'react-router-dom'
import HomeIcon from '../common/HomeIcon'
import styles from '../../pages/DeviceSummaryView.module.css'

export function DeviceNavigationIcons() {
    const navigate = useNavigate()

    return (
        <div className={styles.navigationIcons}>
            <button
                className={styles.iconBtn}
                onClick={() => navigate('/device/edit')}
                title="Edit"
            >
                ✏️
            </button>
            <HomeIcon />
        </div>
    )
}
