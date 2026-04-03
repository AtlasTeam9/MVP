import React from 'react'

// Component for rendering a navigation button,
// which can be used for Back and Forward actions in the navigation footer
export function NavButton({ onClick, disabled, className, title, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={className}
            title={title}
            aria-label={title}
        >
            {children}
        </button>
    )
}
