import React, {useState} from "react";
import {PreviewProps} from "@/interfaces/data";
import {IImage} from "@/custom/media/image/model";
import {ActionIcon} from "@/app/_components/buttons/ActionIcon";
import {Download, Maximize2, Pencil, Trash} from "lucide-react";
import Modal from "@/app/_components/layouts/Modal";

export default function PreviewImage(
    {
        item,
        onClick = () => {
        },
        size = "md",
        className = '',
        disabled = false,
        setIsEditing,
    }: PreviewProps<IImage>) {
    const image = item.getData();
    const [showFullsize, setShowFullsize] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Size mappings for the preview
    const sizeClasses = {
        xs: 'h-16 w-16',
        sm: 'h-24 w-24',
        md: 'h-32 w-32',
        lg: 'h-48 w-48',
        xl: 'h-64 w-64'
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = image.originalName || image.filename || 'image';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this image?')) {
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
                className={`relative group ${sizeClasses[size]} rounded overflow-hidden cursor-pointer ${className} ${
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
                {/* Image */}
                {!imageError ? (
                    <img
                        src={image.url}
                        alt={image.alt || image.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex-center bg-disabled text-background">
                        <span className="text-xs">Error</span>
                    </div>
                )}

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
                    <div className="truncate">{image.title}</div>
                    <div className="text-[10px] opacity-70">
                        {formatFileSize(image.size)} • {image.width && image.height && `${image.width}×${image.height}`}
                    </div>
                </div>
            </div>

            {/* Fullsize modal */}
            {showFullsize && (
                <Modal isOpen={showFullsize} onClose={() => setShowFullsize(false)}>
                    <div className="flex flex-col gap-xs">
                        <h2 className="text-h3">{image.title}</h2>

                        <div className="relative max-h-[70vh] overflow-auto">
                            <img
                                src={image.url}
                                alt={image.alt || image.title}
                                className="w-full h-auto"
                            />
                        </div>

                        <div className="flex flex-col gap-xxs text-sm">
                            {image.caption && (
                                <p className="italic">{image.caption}</p>
                            )}
                            <div className="flex gap-xs text-xs opacity-70">
                                <span>Size: {formatFileSize(image.size)}</span>
                                {image.width && image.height && (
                                    <span>• Dimensions: {image.width}×{image.height}</span>
                                )}
                                <span>• Type: {image.mimetype}</span>
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
            )}
        </>
    );
}