import React from 'react'
import styles from './HomeView.module.css'
import UploadButton from '../components/common/UploadButton'
import { useHomeNavigation } from '../hooks/useHomeNavigation'

// Button group component for the home view
function HomeActions({ actions }) {
    return (
        <div className={styles.buttonGroup}>
            <UploadButton onFileSelect={actions.handleLoadDevice}>
                Upload Device (JSON)
            </UploadButton>

            <button className={styles.button} onClick={actions.handleCreateDevice}>
                Create New Device
            </button>

            <UploadButton onFileSelect={actions.handleLoadPreviousSession}>
                Upload Previous Session
            </UploadButton>
        </div>
    )
}

// Main component for the home view, displaying title, description, and action buttons
function HomeView() {
    const actions = useHomeNavigation()
    return (
        <div className={styles.container}>
            <h1>EN-18031 Compliance Verification</h1>
            <p>Upload a session file or create a new one to get started.</p>
            <HomeActions actions={actions} />
        </div>
    )
}

export default HomeView
