import {ColorVariant, SizeVariant} from "@/types/designTypes";
import {ImageViewer} from "@/app/_components/display/ImageViewer";
import {ReactNode} from "react";

interface Avatar {
    color?: ColorVariant;
    size?: SizeVariant;
    className?: string;
    icon?: ReactNode;
    name?: string;
    src?: string;
}

export const Avatar = ({color, size, className, icon, name, src}: Avatar) => {
    const renderInterior = () => {
        if (src) return <ImageViewer className={'w-full h-full '} src={src} alt={name??"Avatar"}/>;
        if (icon) return icon;
        if (name) return (name.charAt(0) + name.charAt(1)).toUpperCase()
    }
    return (
        <div className={`avatar ${color} ${size} ${className}`}>
            {renderInterior()}
        </div>
    );
}