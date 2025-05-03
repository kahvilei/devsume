import mongoose from 'mongoose';
import { LinkSchema } from "../schemas/link";
import { withSlugGeneration } from '../Post';

const PersonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    img: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    links: [LinkSchema]
});

// Apply common behaviors but use 'name' as the source for the slug
withSlugGeneration(PersonSchema, 'name');

export default mongoose.models.Person || mongoose.model('Person', PersonSchema);