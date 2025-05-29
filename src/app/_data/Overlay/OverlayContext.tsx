"use client"
import React, { createContext, useState } from "react";

interface OverlayContextType {
    overlays: Overlay[];
    setOverlay: (key: string, content: React.ReactNode | null) => void;
    removeOverlay: (key: string) => void;
    clearOverlays: () => void;
    checkNode: (key: string) => boolean;
}

const OverlayContext = createContext<OverlayContextType>({
    overlays: [],
    setOverlay: () => null,
    removeOverlay: () => null,
    clearOverlays: () => null,
    checkNode: () => false,
});

interface Overlay {
    key: string;
    content: React.ReactNode;
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
    const [overlays, setOverlays] = useState<Overlay[]>([]);

    const setOverlay = (key: string, content: React.ReactNode | null) => {
        const copy = [...overlays]
        for (const value of copy) {
            if (value?.key === key) {
                value.content = content;
                setOverlays(copy);
                return;
            }
        }
        setOverlays([...copy, { key, content }])
    };

    const removeOverlay = (key: string) => {
        //remove found key plus everyone down the line
        const copy = [...overlays]
        for (let i = 0; i < copy.length; i++) {
            if (copy[i]?.key === key) {
                copy.splice(i, copy.length - i);
                setOverlays(copy);
                return;
            }
        }
    };

    //checks to see if a key is under other overlays
    const checkNode = (key: string) => {
        let i = 0;
        const copy = [...overlays]
        for (const value of copy) {
            console.log(value?.key, key)
            if (value?.key === key ) {
                return i < overlays.length - 1;
            }
            i++
        }
        return false;
    };

    const clearOverlays = () => {
        setOverlays([]);
    };

    return (
        <OverlayContext.Provider value={{ overlays, setOverlay, removeOverlay, clearOverlays, checkNode }}>
            {children}
        </OverlayContext.Provider>
    );
}

export default OverlayContext;