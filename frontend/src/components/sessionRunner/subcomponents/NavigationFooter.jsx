import React from 'react'
import styles from '../../../pages/SessionRunnerView.module.css'
import { NavButton } from './NavButton'
import { useNavigationButtons } from './useNavigationButtons'

// Component for rendering the navigation footer with Back, Home, and Forward buttons
function NavigationFooter({ pastHistory, futureHistory, isLoading, onBack, onHome, onForward }) {
    const buttons = useNavigationButtons(
        pastHistory,
        futureHistory,
        isLoading,
        onBack,
        onHome,
        onForward
    )

    return (
        <footer className={styles.footer}>
            {buttons.map((btn, idx) => (
                <NavButton key={idx} {...btn}>
                    {btn.label}
                </NavButton>
            ))}
        </footer>
    )
}

export { NavigationFooter }
