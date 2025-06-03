import React, {useEffect} from "react";


export function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClickOutside: () => void = () => {}) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
                onClickOutside();
            }

        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClickOutside, ref]);
}