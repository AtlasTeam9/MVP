import React from 'react'
import styles from '../../../pages/SessionRunnerView.module.css'
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
            {buttons.map((btn, idx) => {
                if (idx === 1) {
                    return <HomeIcon key={idx} />
                }
                return (
                    <NavButton key={idx} {...btn}>
                        {btn.label}
                    </NavButton>
                )
            })}
        </footer>
    )
}

export { NavigationFooter }
