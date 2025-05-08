import mongoose, {Types} from 'mongoose';
import {Link, LinkSchema} from './schemas/link';
import {IUser} from "@/models/User";
import {IImage} from "@/models/Image";
import {ITag} from "@/models/categories/Tag";
import {BaseDataModel} from "@/interfaces/api";

export interface IResume extends BaseDataModel {
    _id?: string;
    slug?: string;
    user?: Types.ObjectId | IUser;
    name: string;
    title: string;
    subtitle?: string;
    links?: Link[];
    image?: Types.ObjectId | IImage;
    about?: string;
    tags?: string[] | ITag[] | Types.ObjectId[];
    posts?: {
        title: string;
        posts: Types.ObjectId[] | string | [];
    }[];
}

const ResumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    links: [LinkSchema],
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, // Reference to the Image model
    about: { type: String },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    posts: [
        {
            title: { type: String },
            posts: {type: mongoose.Schema.Types.Mixed}
        }
    ]
});

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);