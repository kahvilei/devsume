import Image from "next/image";

interface ImageProps {
    className?: string;
    src: string;
    alt: string;
    width?: number;
    height?: number;
}

export const ImageViewer = ({src, alt, className, width, height}: ImageProps) => {
    return (
        <Image
            src={src}
            alt={alt}
            width={width??300}
            height={height??300}
            className={className}
        />
    )
}
