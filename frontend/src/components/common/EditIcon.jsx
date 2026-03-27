import React from 'react'
import styles from '../../pages/DeviceSummaryView.module.css'

// Simple EditIcon component that navigates to the edit page
function EditIcon() {
    return (
        <button className={styles.iconBtn} title="Edit">
            ✏️
        </button>
    )
}

export default EditIcon
