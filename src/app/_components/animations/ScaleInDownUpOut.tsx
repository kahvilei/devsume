"use client"

import {motion} from "motion/react"
import React from "react";

interface ScaleInDownUpOutProps {
    children: React.ReactNode;
    layout?: boolean;
}

export default function ScaleInDownUpOut
({
     children,
     layout = true,
 }: ScaleInDownUpOutProps) {
    return (
        <motion.div

            initial={{opacity: 0, scale: .6, originX: 0, originY: 0}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: .6}}
            layout={layout}
        >
            {children}
        </motion.div>

    )
}
