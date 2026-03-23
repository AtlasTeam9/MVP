import React from 'react'
import SessionService from '../services/SessionService'
import useSessionStore from '../store/SessionStore'
import styles from './SessionRunnerView.module.css' // TODO: da creare

export default function SessionRunnerView() {
    // Leggiamo lo stato attuale dallo store (es. il nodo corrente/domanda)
    const currentNode = useSessionStore((state) => state.currentNode)

    // --- Metodi definiti nell'UML ---

    const handleYesClick = () => {
        SessionService.sendAnswer(true)
    }

    const handleNoClick = () => {
        SessionService.sendAnswer(false)
    }

    const handleBackClick = () => {
        SessionService.previousStep()
    }

    const handleForwardClick = () => {
        SessionService.forwardStep()
    }

    const handleSaveAndExitClick = () => {
        SessionService.saveAndExit()
    }

    // Corrisponde al metodo + render(): JSX.Element
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2>Sessione in corso</h2>
                <button onClick={handleSaveAndExitClick} className={styles.btnExit}>
                    Salva ed Esci
                </button>
            </header>

            <main className={styles.questionContainer}>
                {/* Mostriamo il testo del nodo se esiste, altrimenti un fallback */}
                <h3>{currentNode ? currentNode.text : 'Caricamento domanda...'}</h3>
                {currentNode?.description && <p>{currentNode.description}</p>}

                <div className={styles.answerButtons}>
                    <button onClick={handleYesClick} className={styles.btnYes}>
                        SI
                    </button>
                    <button onClick={handleNoClick} className={styles.btnNo}>
                        NO
                    </button>
                </div>
            </main>

            <footer className={styles.navigation}>
                <button onClick={handleBackClick}>&larr; Indietro</button>
                <button onClick={handleForwardClick}>Avanti &rarr;</button>
            </footer>
        </div>
    )
}
