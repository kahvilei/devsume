"use client"
import React, {createContext, useState} from "react";

interface OverlayContextType {
    overlay: React.ReactNode;
    setOverlay: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}

const OverlayContext = createContext<OverlayContextType>({ overlay: null, setOverlay: () => null});

export function OverlayProvider({ children }: { children: React.ReactNode }) {
    const [overlay, setOverlay] = useState<React.ReactNode>(null);

    return (
        <OverlayContext.Provider value={{ overlay, setOverlay }}>
            {children}
        </OverlayContext.Provider>
    );
}


export default OverlayContext;