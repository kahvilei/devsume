import React from 'react';

interface PillProps {
    label: string;
    value?: string | number;
    onClick: () => void;
    isActive?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

/**
 * Pill component - Used to display an interactive pill with a label and optional value badge
 *
 * This component is a general-purpose UI element that shows a label and an optional value badge.
 * It can be used in various contexts where a compact interactive element is needed.
 */
export const Pill: React.FC<PillProps> = ({
                                              label,
                                              value,
                                              onClick,
                                              isActive = false,
                                              icon,
                                              className = ''
                                          }) => {
    // Format value for display if needed
    const displayValue = value !== undefined ? String(value) : '—';

    // Check if value is considered "set" (for badges)
    const hasValue = value !== undefined && value !== '' && value !== 0;

    return (
        <button
            type="button"
            className={`pill ${isActive ? 'active' : ''} ${className}`}
            onClick={onClick}
        >
            {icon && <span className="pill-icon">{icon}</span>}
            <span className="pill-label">{label}</span>
            <span className={`pill-badge ${hasValue ? 'has-value' : ''}`}>
                {displayValue}
            </span>
        </button>
    );
};

export default Pill;