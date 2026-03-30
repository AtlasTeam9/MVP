import React from 'react'
import styles from '../SessionRunnerComponents.module.css'
import { NavButton } from './NavButton'
import HomeIcon from '../../common/HomeIcon'
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
            {buttons.map((btn) => {
                if (btn.id === 'home') {
                    return <HomeIcon key={btn.id} onHome={btn.onClick} className={btn.className} />
                }
                return (
                    <NavButton key={btn.id} {...btn}>
                        {btn.label}
                    </NavButton>
                )
            })}
        </footer>
    )
}

export { NavigationFooter }
