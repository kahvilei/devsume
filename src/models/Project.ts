import mongoose from 'mongoose';
import { PostSchema, applyPostBehaviors } from './post';

const ProjectSchema = new mongoose.Schema({
    ...PostSchema,
    date: { type: Date }, // Single date for a project vs. date range for job
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator' }],
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }
});

// Apply all common behaviors
applyPostBehaviors(ProjectSchema);

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);