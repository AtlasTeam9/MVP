import { useNavigate } from 'react-router-dom'
import styles from '../../pages/DeviceSummaryView.module.css'

export function DeviceMainActions() {
    const navigate = useNavigate()

    return (
        <div className={styles.mainActions}>
            <button onClick={() => console.log('Info')} className={styles.btnPrimary}>
                Show device details
            </button>
            <button onClick={() => navigate('/device/test')} className={styles.btnPrimary}>
                START TEST
            </button>
        </div>
    )
}
