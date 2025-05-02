import mongoose from 'mongoose';
import { PostSchema, applyPostBehaviors } from './post';

const JobSchema = new mongoose.Schema({
    ...PostSchema,
    location: { type: String },
    dates: {
        start: { type: Date },
        end: { type: Date }
    },
    link: { type: String },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
});

// Apply all common behaviors
applyPostBehaviors(JobSchema);

export default mongoose.models.Job || mongoose.model('Job', JobSchema);