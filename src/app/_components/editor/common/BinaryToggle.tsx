import React from "react";
import Tooltip from "@/app/_components/common/Tooltip";

interface BinaryToggleProps {
    state: boolean;
    onToggle: (bool: boolean) => void;
    label?: [string, string];
    elements?: [React.ReactNode, React.ReactNode];
    id?: string;
}

export default function BinaryToggle(
    {
        state,
        onToggle,
        label = ["On", "Off"],
        elements = ["On", "Off"],
        id = `toggle-${Math.random().toString(36).substring(2, 11)}`
    }: BinaryToggleProps
) {

    const handleOptionClick = (newState: boolean): void => {
        if (newState === state) return;
        onToggle(newState);
    };

    return (
            <div className="binary-toggle">
                <label htmlFor={id} className="toggle-switch">
                    <input
                        id={id}
                        aria-label={"Toggle " + label[0] + "/" + label[1]}
                        type="checkbox"
                        checked={state}
                        tabIndex={0}
                    />
                    <span className="toggle-slider"></span>

                    <span
                        aria-selected={state}
                        className="toggle-1 toggle-option"
                        onClick={() => handleOptionClick(false)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleOptionClick(false);
                                e.preventDefault();
                            }
                        }}
                    >
                        <Tooltip text={label[0]} position={"above"}>
                        {elements[0]}
                        </Tooltip>
                    </span>


                    <span
                        aria-selected={!state}
                        className="toggle-2 toggle-option"
                        onClick={() => handleOptionClick(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleOptionClick(true);
                                e.preventDefault();
                            }
                        }}
                    >
                        <Tooltip text={label[1]} position={"above"}>
                        {elements[1]}
                        </Tooltip>
                    </span>

                </label>
            </div>
    );
}