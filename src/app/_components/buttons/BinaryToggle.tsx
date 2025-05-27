import React from "react";
import Tooltip from "@/app/_components/layouts/Tooltip";
import {ButtonVariant, RadiusSize, Size} from "@/types/designTypes";

interface BinaryToggleProps {
    state: boolean;
    onToggle: (bool: boolean) => void;
    label?: [string, string];
    elements?: [React.ReactNode, React.ReactNode];
    id?: string;
    size?: Size;
    radius?: RadiusSize;
    variant?: ButtonVariant;
    orientation?: "horizontal" | "vertical";
}

export default function BinaryToggle(
    {
        state,
        onToggle,
        label = ["On", "Off"],
        elements = ["On", "Off"],
        size = "md",
        radius = "rounded-full",
        variant = "btn-shadow-spread",
        orientation = "horizontal",
    }: BinaryToggleProps
) {

    const handleOptionClick = (newState: boolean): void => {
        if (newState === state) return;
        onToggle(newState);
    };

    return (
        <div className={`binary-toggle-wrap`}>
            <div className={`binary-toggle ${orientation} ${size} ${radius} ${variant}`} role="radiogroup">
                <label className="toggle-switch">
                    <span
                        aria-checked={!state}
                        className="toggle-1 toggle-option"
                        onClick={() => handleOptionClick(false)}
                        role="radio"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleOptionClick(false);
                                e.preventDefault();
                            }
                        }}
                    >
                        <Tooltip text={label[0]} position={"above"}>
                            <span className="toggle-inner">{elements[0]}</span>
                        </Tooltip>
                    </span>
                    <span
                        aria-checked={state}
                        className="toggle-2 toggle-option"
                        onClick={() => handleOptionClick(true)}
                        role="radio"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleOptionClick(true);
                                e.preventDefault();
                            }
                        }}
                    >
                        <Tooltip text={label[1]} position={"above"}>
                            <span className="toggle-inner">{elements[1]}</span>
                        </Tooltip>
                    </span>
                    <span className="toggle-slider"></span>
                </label>
            </div>
        </div>
    );
}