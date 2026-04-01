import styles from '@presentation/components/sessionRunner/SessionRunnerComponents.module.css'

// Custom hook to generate navigation button configurations based on history and loading state

// Array of configurations for the Back, Home, and Forward buttons
const BUTTON_BASE_CONFIGS = [
    {
        id: 'back',
        className: styles.btnNav,
        title: 'Previous question',
        label: '← Previous question',
    },
    { id: 'home', title: 'Return to home' },
    { id: 'forward', className: styles.btnNav, title: 'Next question', label: 'Next question →' },
]

// Hook to create button configurations for navigation buttons
function useNavigationButtons(pastHistory, futureHistory, isLoading, onBack, onHome, onForward) {
    const buttonRuntimeConfig = {
        back: {
            onClick: onBack,
            disabled: pastHistory.length === 0 || isLoading,
        },
        home: {
            onClick: onHome,
            disabled: isLoading,
        },
        forward: {
            onClick: onForward,
            disabled: futureHistory.length === 0 || isLoading,
        },
    }

    return BUTTON_BASE_CONFIGS.map((config) => ({
        ...config,
        ...buttonRuntimeConfig[config.id],
    }))
}

export { useNavigationButtons }
