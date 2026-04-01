import React from 'react'
import styles from '@presentation/components/sessionRunner/SessionRunnerComponents.module.css'
import { NavButton } from '@presentation/components/sessionRunner/subcomponents/NavButton'
import HomeIcon from '@presentation/components/common/HomeIcon'
import { useNavigationButtons } from '@presentation/components/sessionRunner/subcomponents/useNavigationButtons'
import { useSessionRunnerContext } from '@presentation/components/sessionRunner/SessionRunnerContext'

// Component for rendering the navigation footer with Back, Home, and Forward buttons
function NavigationFooter() {
    const ctx = useSessionRunnerContext()

    const buttons = useNavigationButtons(
        ctx?.pastHistory ?? [],
        ctx?.futureHistory ?? [],
        ctx?.isLoading ?? false,
        ctx?.onBack,
        ctx?.onHome,
        ctx?.onForward
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
