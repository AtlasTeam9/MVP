import { useNavigate } from 'react-router-dom'
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
            <button className={styles.iconBtn} onClick={() => navigate('/')} title="Home">
                🏠
            </button>
        </div>
    )
}
