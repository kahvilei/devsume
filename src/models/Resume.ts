import mongoose, {Types} from 'mongoose';
import {Link, LinkSchema} from './schemas/link';

export interface IResume {
    _id: never | this;
    user: Types.ObjectId;
    first: string;
    last: string;
    title?: string;
    subtitle?: string;
    links?: Link[];
    img?: Types.ObjectId;
    theme?: Types.ObjectId;
    about?: string;
}

const ResumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    first: { type: String, required: true },
    last: { type: String, required: true },
    title: { type: String, unique: true },
    subtitle: { type: String },
    links: [LinkSchema],
    img: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, // Reference to the Image model
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' },
    about: { type: String }
});

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);