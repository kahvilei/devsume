import mongoose from 'mongoose';

export interface IImage {
    filename: string;
    originalName: string;
    path: string;
    url: string;
    size: number;
    mimetype: string;
    width: number;
    height: number;
    alt: string;
    caption: string;
    blurDataUrl: string;
    createdAt: Date;
    metadata: {
        title: string;
        description: string;
        tags: string[];
    };
}
const ImageSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String, default: '' },
    caption: { type: String },
    blurDataUrl: { type: String }, // For next/image optimization
    createdAt: { type: Date, default: Date.now },
    metadata: {
        title: { type: String },
        description: { type: String },
        tags: [{ type: String }]
    }
});

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);