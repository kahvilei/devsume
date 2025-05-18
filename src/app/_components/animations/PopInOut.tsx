"use client"

import {motion} from "motion/react"
import React from "react";

interface PopInOutProps {
    children: React.ReactNode;
    layout?: boolean;
}

export default function PopInOut
({
    children,
    layout = true,
 }: PopInOutProps) {
    return (
        <motion.div

            initial={{opacity: 0, scale: 0}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0}}
            layout={layout}
        >
            {children}
        </motion.div>

    )
}
