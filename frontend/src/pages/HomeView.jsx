import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './HomeView.module.css'

export default function HomeView() {
    const navigate = useNavigate()

    // --- Class methods ---
    const handleLoadDevice = () => {
        // TODO: inserire logica per caricare il file JSON del dispositivo
    }

    const handleCreateDevice = () => {
        navigate('/device-form')
    }

    const handleLoadPreviousSession = () => {
        // TODO: inserire logica per ripristinare una sessione salvata
    }

    // --- Render method ---
    return (
        <div className={styles.container}>
            <h1>EN-18031 Compliance Validation</h1>
            <p>Upload a session file or create a new one to get started.</p>

            <div className={styles.buttonGroup}>
                {/* TODO: Questo diventerà <UploadButton /> */}
                <button className={styles.button} onClick={handleLoadDevice}>
                    Carica Dispositivo (JSON)
                </button>

                <button className={styles.button} onClick={handleCreateDevice}>
                    Crea Nuovo Dispositivo
                </button>

                {/* TODO: Questo diventerà <UploadButton /> */}
                <button className={styles.button} onClick={handleLoadPreviousSession}>
                    Carica Sessione Precedente
                </button>
            </div>
        </div>
    )
}
