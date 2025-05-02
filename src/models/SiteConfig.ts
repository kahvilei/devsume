import mongoose from 'mongoose';
import { LinkSchema } from './schemas/link';

const SiteConfigSchema = new mongoose.Schema({
    siteTitle: { type: String, required: true },
    siteDescription: { type: String },
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