import React, { useState, useRef } from "react";
import { EditProps } from "@/interfaces/data";
import WysiwygText from "@/app/_components/input/WysiwygText";
import { Save, Upload, X, Image as ImageIcon } from "lucide-react";
import ActionIcon from "@/app/_components/buttons/ActionIcon";
import {IMedia} from "@/server/models/Media";

export default function EditMedia({ item, onCancel }: EditProps<IMedia>) {
    const media = item.getData();
    const [title, setTitle] = useState(media.title);
    const [alt, setAlt] = useState(media.alt || '');
    const [caption, setCaption] = useState(media.caption || '');
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string>(media.url || '');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (10MB limit by default)
            if (file.size > 10 * 1024 * 1024) {
                setUploadError('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setUploadError('');
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setUploading(true);
        setUploadError('');
        try {
            await item.setDataAndSaveAsForm({ ...media, title, alt, caption, file: selectedFile });
            onCancel();
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(
                error instanceof Error ? error.message : 'Failed to upload media'
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-md">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                }}
                className="flex flex-col gap-sm"
            >
                {/* Image Preview */}
                <div className="relative w-full h-60 bg-background content-style-1 rounded overflow-hidden">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={alt || 'Image preview'}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="flex-center h-full text-disabled">
                            <ImageIcon size={48} />
                        </div>
                    )}

                    {/* Upload overlay */}
                    <div
                        className="absolute inset-0 bg-overlay opacity-0 hover:opacity-100 transition-opacity flex-center cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-background text-center">
                            <Upload size={32} className="mx-auto mb-2" />
                            <p>Click to upload image</p>
                        </div>
                    </div>
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Image metadata */}
                <div className="flex flex-col gap-xs">
                    <WysiwygText
                        value={title}
                        label="Title"
                        placeholder="Image title"
                        onUpdate={setTitle}
                        required
                    />

                    <WysiwygText
                        value={alt}
                        label="Alt text"
                        placeholder="Describe this image for accessibility"
                        onUpdate={setAlt}
                    />

                    <WysiwygText
                        value={caption}
                        label="Caption"
                        placeholder="Optional caption"
                        onUpdate={setCaption}
                    />
                </div>

                {/* Error message */}
                {uploadError && (
                    <div className="text-danger text-sm">{uploadError}</div>
                )}

                {/* Action buttons */}
                <div className="flex gap-xs justify-end">
                    <ActionIcon
                        type="submit"
                        icon={<Save />}
                        tooltip={uploading ? "Uploading..." : "Save"}
                        size="sm"
                        variant="btn-shadow-filled"
                        color="primary"
                        disabled={uploading || !title}
                    />
                    <ActionIcon
                        onClick={onCancel}
                        icon={<X />}
                        tooltip="Cancel"
                        size="sm"
                        variant="btn-light"
                        color="foreground"
                        disabled={uploading}
                    />
                </div>
            </form>
        </div>
    );
}