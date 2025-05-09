import React from "react";

interface BinaryToggleProps {
    state: boolean;
    onToggle: (bool: boolean) => void;
    label?: string;
    labels?: [string, string];
}
export default function BinaryToggle(
    {
        state,
        onToggle,
        label = "Toggle",
        labels = ["On", "Off"]
    }: BinaryToggleProps
) {

    const handleToggleDynamic = (): void => {
        const newState = !state;
        onToggle(newState);
    };
    return (
        <div className="binary-toggle">
            <label className="toggle-switch">
                <input
                    aria-label={label}
                    type="checkbox"
                    checked={state}
                    onChange={handleToggleDynamic}
                />
                <span className="toggle-slider"></span>
                <span aria-selected={state} className="toggle-1 toggle-option">{labels[0]}</span>
                <span aria-selected={!state} className="toggle-2 toggle-option">{labels[1]}</span>
            </label>
        </div>
    )
}
