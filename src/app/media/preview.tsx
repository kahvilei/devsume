import React, {useState} from "react";
import {PreviewProps} from "@/interfaces/data";
import {ActionIcon} from "@/app/_components/buttons/ActionIcon";
import {Download, Maximize2, Pencil, Trash} from "lucide-react";
import Modal from "@/app/_components/layouts/Modal";
import {IMedia} from "@/server/models/Media";
import {MediaViewer} from "@/app/_components/display/media/MediaViewer";

export default function PreviewMedia(
    {
        item,
        onClick = () => {
        },
        className = '',
        disabled = false,
        setIsEditing,
    }: PreviewProps<IMedia>) {
    const media = item.getData();
    const [showFullsize, setShowFullsize] = useState(false);

    const handleDownload = async () => {
        try {
            const response = await fetch(media.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = media.originalName || media.filename || 'image';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this media?')) {
            await item.delete();
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                className={`relative group rounded overflow-hidden cursor-pointer ${className} ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={(e) => {
                    if (!disabled) {
                        e.stopPropagation();
                        onClick();
                    }
                }}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                        e.preventDefault();
                        onClick();
                    }
                }}
            >
               <MediaViewer item={item} />

                {/* Overlay with actions */}
                <div
                    className="absolute inset-0 bg-overlay opacity-0 group-hover:opacity-100 transition-opacity flex-center">
                    <div className="flex gap-xxs">
                        <ActionIcon
                            onClick={() => {
                                setShowFullsize(true);
                            }}
                            icon={<Maximize2/>}
                            tooltip="View fullsize"
                            size="xs"
                            variant="btn-light"
                            color="background"
                            radius="rounded"
                        />

                        <ActionIcon
                            onClick={handleDownload}
                            icon={<Download/>}
                            tooltip="Download"
                            size="xs"
                            variant="btn-light"
                            color="background"
                            radius="rounded"
                        />

                        {setIsEditing && (
                            <ActionIcon
                                onClick={() => {
                                    setIsEditing(true);
                                }}
                                icon={<Pencil/>}
                                tooltip="Edit image"
                                size="xs"
                                variant="btn-light"
                                color="background"
                                radius="rounded"
                            />
                        )}
                        <ActionIcon
                            onClick={() => {
                                handleDelete();
                            }}
                            icon={<Trash/>}
                            tooltip="Delete image"
                            size="xs"
                            variant="btn-light"
                            color="danger"
                            radius="rounded"
                        />
                    </div>
                </div>

                {/* Image info tooltip */}
                <div
                    className="absolute bottom-0 left-0 right-0 bg-dark/80 text-background text-xs p-xxs opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="truncate">{media.title}</div>
                </div>
            </div>
            <Modal isOpen={showFullsize} setIsOpen={setShowFullsize}>
                <div className="flex flex-col gap-xs">
                    <h2 className="text-h3">{media.title}</h2>

                    <MediaViewer
                        item = {item}
                        className="relative max-h-[70vh] overflow-auto"
                    />

                    <div className="flex flex-col gap-xxs text-sm">
                        {media.caption && (
                            <p className="italic">{media.caption}</p>
                        )}
                        <div className="flex gap-xs text-xs opacity-70">
                            <span>Size: {formatFileSize(media.size)}</span>
                            <span>• Type: {media.mimetype}</span>
                        </div>
                    </div>

                    <div className="flex gap-xs justify-end">
                        <ActionIcon
                            onClick={() => handleDownload}
                            icon={<Download/>}
                            tooltip="Download"
                            size="sm"
                            variant="btn-shadow-filled"
                            color="primary"
                        />
                        {setIsEditing && (
                            <ActionIcon
                                onClick={() => {
                                    setShowFullsize(false);
                                    setIsEditing(true);
                                }}
                                icon={<Pencil/>}
                                tooltip="Edit"
                                size="sm"
                                variant="btn-light"
                                color="foreground"
                            />
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}