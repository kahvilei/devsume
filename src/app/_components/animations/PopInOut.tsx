"use client"

import {motion} from "motion/react"
import React from "react";

interface PopInOutProps {
    children: React.ReactNode,
    layout?: boolean,
}

const transition = {
    duration: 0.1,
    delay: 0
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
            transition={transition}
            layout={layout}
        >
            {children}
        </motion.div>

    )
}
