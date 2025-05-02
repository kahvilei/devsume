import mongoose from 'mongoose';
import {LinkSchema} from "@/models/link";

const ResumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    first: { type: String, required: true },
    last: { type: String, required: true },
    title: { type: String },
    subtitle: { type: String },
    links: [LinkSchema],
    img: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, // Reference to Image model
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' },
    about: { type: String }
});

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);