import Image from "next/image";
import React from "react";

interface ImageProps {
    className?: string;
    src: string;
    alt: string;
    width?: number;
    height?: number;
}

export const ImageViewer = ({src, alt, className, width, height}: ImageProps) => {
    const [imageError, setImageError] = React.useState(false);
    return (
        !imageError ? (
            <Image
                src={src}
                alt={alt}
                width={width??300}
                height={height??300}
                className={className}
                onError={() => setImageError(true)}
            />
        ) : (
            <div className={className + " media-error"}>
                <span>No image</span>
            </div>
        )
    );
}