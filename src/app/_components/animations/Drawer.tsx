"use client"

import {motion} from "motion/react"
import React from "react";

interface DrawerProps {
    children: React.ReactNode;
    visible?: boolean;
}

export default function DrawerProps
({
     children,
 }: DrawerProps) {
    return (
        <motion.div
            initial={{opacity: 0, height: 0}}
            animate={{opacity: 1, height: '100%'}}
            exit={{opacity: 0, height: 0}}
        >
            {children}
        </motion.div>

    )
}
