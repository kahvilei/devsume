import {Item} from "@/app/_data/Items/Item";
import {IMedia} from "@/server/models/Media";
import Image from "next/image";
import React from "react";
import {observer} from "mobx-react-lite";

interface MediaProps<T extends IMedia> {
    item: Item<T>;
    className?: string;
    width?: number;
    height?: number;
}

export const MediaViewer = observer(<T extends IMedia>({item, className, width, height}:MediaProps<T>) => {
    const media = item.getData();
    const [imageError, setImageError] = React.useState(false);
    return (
        <div className="media-container">
            {!imageError ? (
                <Image
                    src={media.url}
                    alt={media.alt || media.title}
                    width={width??400}
                    height={height??400}
                    placeholder="blur"
                    blurDataURL={media.url}
                    onError={() => setImageError(true)}
                    loading="lazy"
                    className={className}
                />
            ) : (
                <div className={className + " media-error"}>
                    <span>Error</span>
                </div>
            )}
        </div>
    )
});