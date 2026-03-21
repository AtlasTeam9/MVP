import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './HomeView.module.css'
import UploadButton from '../components/common/UploadButton'
import DeviceService from '../services/DeviceService'

// Custom hook for managing navigation logic in the home view
function useHomeNavigation() {
    const navigate = useNavigate()

    const handleLoadDevice = async (file) => {
        try {
            const deviceData = await DeviceService.receiveFile(file)
            console.log('Device data loaded:', deviceData)
            navigate('/device/summary')
        } catch (err) {
            console.error('Error loading device:', err.message)
            alert('Failed to load device: ' + err.message)
        }
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
