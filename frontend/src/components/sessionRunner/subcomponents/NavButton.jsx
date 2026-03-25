import React from 'react'

// Component for rendering a navigation button,
// which can be used for Back, Home, and Forward actions in the navigation footer
export function NavButton({ onClick, disabled, className, title, children }) {
    return (
        <button onClick={onClick} disabled={disabled} className={className} title={title}>
            {children}
        </button>
    )
}
