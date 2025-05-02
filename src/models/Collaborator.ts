import mongoose from 'mongoose';
import { LinkSchema } from "@/models/link";
import { withSlugGeneration } from './post';

const CollaboratorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    img: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    links: [LinkSchema]
});

// Apply common behaviors but use 'name' as the source for the slug
withSlugGeneration(CollaboratorSchema, 'name');

export default mongoose.models.Collaborator || mongoose.model('Collaborator', CollaboratorSchema);