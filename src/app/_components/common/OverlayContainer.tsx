'use client'
import {AnimatePresence} from "motion/react";
import React, {useContext} from "react";
import OverlayContext from "@/app/_data/OverlayContext";

export const OverlayContainer: React.FC = () => {
    const {overlay} = useContext(OverlayContext);
    return (
        <AnimatePresence>
            {overlay}
        </AnimatePresence>
    )
}