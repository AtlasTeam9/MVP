import styles from '../../../pages/SessionRunnerView.module.css'

// Custom hook to generate navigation button configurations based on history and loading state

// Array of configurations for the Back, Home, and Forward buttons
const BUTTON_BASE_CONFIGS = [
    { className: styles.btnNav, title: 'Previous question', label: '← Previous question' },
    { className: styles.btnHome, title: 'Return to home', label: '🏠' },
    { className: styles.btnNav, title: 'Next question', label: 'Next question →' },
]

// Hook to create button configurations for navigation buttons
function useNavigationButtons(pastHistory, futureHistory, isLoading, onBack, onHome, onForward) {
    const handlers = [onBack, onHome, onForward]
    const disabledStates = [
        pastHistory.length === 0 || isLoading,
        isLoading,
        futureHistory.length === 0 || isLoading,
    ]
    return BUTTON_BASE_CONFIGS.map((config, i) => ({
        ...config,
        onClick: handlers[i],
        disabled: disabledStates[i],
    }))
}

export { useNavigationButtons }
