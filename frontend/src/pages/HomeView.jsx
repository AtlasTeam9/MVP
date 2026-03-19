import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './HomeView.module.css'

// Custom hook for managing navigation logic in the home view
function useHomeNavigation() {
    const navigate = useNavigate()

    const handleLoadDevice = async () => {
        // TODO: inserire logica per caricare il file JSON del dispositivo
    }

    const handleCreateDevice = () => {
        navigate('/device/new')
    }

    const handleLoadPreviousSession = () => {
        // TODO: inserire logica per ripristinare una sessione salvata
    }

    return {
        handleLoadDevice,
        handleCreateDevice,
        handleLoadPreviousSession,
    }
}

// Button group component for the home view
function HomeActions({ actions }) {
    return (
        <div className={styles.buttonGroup}>
            {/* TODO: Questo diventerà <UploadButton /> */}
            <button className={styles.button} onClick={actions.handleLoadDevice}>
                Upload Device (JSON)
            </button>

            <button className={styles.button} onClick={actions.handleCreateDevice}>
                Create New Device
            </button>

            {/* TODO: Questo diventerà <UploadButton /> */}
            <button className={styles.button} onClick={actions.handleLoadPreviousSession}>
                Upload Previous Session
            </button>
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
