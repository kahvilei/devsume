"use client";
import { AnimatePresence } from "motion/react";
import React, { useContext } from "react";
import OverlayContext from "@/app/_data/Overlay/OverlayContext";

export const OverlayContainer: React.FC = () => {
    const { overlays } = useContext(OverlayContext);

    return (
        <AnimatePresence>
            {overlays.map((overlay) => overlay.content)}
        </AnimatePresence>
    );
};
