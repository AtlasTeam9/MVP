import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './HomeView.module.css'

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

function HomeActions({ actions }) {
    return (
        <div className={styles.buttonGroup}>
            {/* TODO: Questo diventerà <UploadButton /> */}
            <button className={styles.button} onClick={actions.handleLoadDevice}>
                Carica Dispositivo (JSON)
            </button>

            <button className={styles.button} onClick={actions.handleCreateDevice}>
                Crea Nuovo Dispositivo
            </button>

            {/* TODO: Questo diventerà <UploadButton /> */}
            <button className={styles.button} onClick={actions.handleLoadPreviousSession}>
                Carica Sessione Precedente
            </button>
        </div>
    )
}

export default function HomeView() {
    const actions = useHomeNavigation()

    return (
        <div className={styles.container}>
            <h1>EN-18031 Compliance Validation</h1>
            <p>Upload a session file or create a new one to get started.</p>
            <HomeActions actions={actions} />
        </div>
    )
}
