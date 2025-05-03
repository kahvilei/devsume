// src/models/tag.ts
import mongoose from 'mongoose';
import { withSlugGeneration } from '../Post';

const TagSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String }
});

// Apply timestamps and auto-slug generation
withSlugGeneration(TagSchema);

export default mongoose.models.Tag || mongoose.model('Tag', TagSchema);