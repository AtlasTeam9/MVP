import React from 'react'
import styles from './SessionRunnerComponents.module.css'
import { SessionHeader, QuestionSection, NavigationFooter } from './subcomponents'
import { SessionRunnerProvider } from './SessionRunnerContext'

// Main component for rendering the session content,
// including header, question section, and navigation footer
function SessionContent({ sessionContextValue }) {

    return (
        <SessionRunnerProvider value={sessionContextValue}>
            <div className={styles.container}>
                <SessionHeader />
                <QuestionSection />
                <NavigationFooter />
            </div>
        </SessionRunnerProvider>
    )
}

export { SessionContent }
