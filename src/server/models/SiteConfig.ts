import mongoose from 'mongoose';
import { LinkSchema } from '@/server/models/schemas/link';

const SiteConfigSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    siteLogo: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    mainResume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    navLinks: [LinkSchema], // Using the shared LinkSchema
    footer: {
        text: { type: String },
        links: [LinkSchema] // Using the shared LinkSchema
    },
    metaTags: {
        keywords: { type: String },
        author: { type: String },
        ogImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }
    }
});

export default mongoose.models.SiteConfig || mongoose.model('SiteConfig', SiteConfigSchema);