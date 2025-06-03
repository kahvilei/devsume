import React, {useEffect} from "react";

export function useClickOutside(
    ref: React.RefObject<HTMLElement | null>,
    onClickOutside: () => void = () => {},
    excludeRefs?: React.RefObject<HTMLElement | null> | React.RefObject<HTMLElement | null>[]
) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: MouseEvent) {
            if (!ref.current || !(event.target instanceof Node)) {
                return;
            }

            // Check if click is within the main ref
            if (ref.current.contains(event.target)) {
                return;
            }

            // Check if click is within any excluded refs
            if (excludeRefs) {
                const excludeArray = Array.isArray(excludeRefs) ? excludeRefs : [excludeRefs];
                const isWithinExcluded = excludeArray.some(excludeRef =>
                    excludeRef?.current?.contains(event.target as Node)
                );

                if (isWithinExcluded) {
                    return;
                }
            }

            // Check if click is within a div of class "modal"
            const modalElement = (event.target as Element).closest('.modal');
            if (modalElement) {
                return;
            }

            // If we get here, the click was outside all refs
            onClickOutside();
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClickOutside, ref, excludeRefs]);
}