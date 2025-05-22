import mongoose from 'mongoose';
import {BaseDataModel} from "@/interfaces/data";

export interface IMedia extends BaseDataModel{
    _id?: string;
    filename: string;
    originalName: string;
    path: string;
    url: string;
    size: number;
    mimetype: string;
    alt: string;
    caption: string;
    blurDataUrl: string;
    createdAt: Date;
    metadata: {
        description: string;
        tags: string[];
    };
    formData?: FormData; //only exists front-side for upload
}
export const MediaSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    title: { type: String },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    alt: { type: String, default: '' },
    caption: { type: String },
    blurDataUrl: { type: String }, // For next/image optimization
    createdAt: { type: Date, default: Date.now },
    metadata: {
        description: { type: String },
        tags: [{ type: String }]
    }
});

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);