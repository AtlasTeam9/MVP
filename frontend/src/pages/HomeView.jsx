import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './HomeView.module.css'
import UploadButton from '../components/common/UploadButton'
import SessionService from '../services/SessionService'

// Custom hook for managing navigation logic in the home view
function useHomeNavigation() {
    const navigate = useNavigate()

    const handleLoadDevice = async (file) => {
        try {
            await SessionService.createSessionWithFile(file)
            navigate('/device/summary')
        } catch (err) {
            console.error('Error loading device:', err.message) // TODO: da eliminare, solo per debug
            alert('Failed to load device: ' + err.message)
        }
    }

    const handleCreateDevice = () => {
        navigate('/device/new')
    }

    const handleLoadPreviousSession = async (file) => {
        try {
            await SessionService.loadSessionFromFile(file)
            navigate('/results')
        } catch (err) {
            console.error('Error loading previous session:', err.message)
            alert('Failed to load session: ' + err.message)
        }
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
