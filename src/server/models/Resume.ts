import mongoose from 'mongoose';
import {Link, LinkSchema} from '@/server/models/schemas/link';
import {IUser} from "@/server/models/User";
import {IMedia} from "@/server/models/Media";
import {IPost} from "@/server/models/Post";
import {Item, ItemBaseSchema} from "@/server/models/schemas/item";
import {Section, SectionSchema} from "@/server/models/schemas/section";
import {ICategory} from "@/server/models/Category";
import {withSlugGeneration} from "@/lib/models/withSlugGeneration";
import {withDrafts} from "@/lib/models/withDrafts";

export interface IResume extends Item {
    user?: IUser;
    name: string;
    subtitle?: string;
    links?: Link[];
    image?: IMedia;
    about?: string;
    categories?: Section<ICategory>[];
    posts?: Section<IPost>[];
}

const ResumeSchema = new mongoose.Schema({
    ...ItemBaseSchema,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    subtitle: { type: String },
    links: [LinkSchema],
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, // Reference to the Image model
    about: { type: String },
    categories: [SectionSchema],
    posts: [SectionSchema]
});

withSlugGeneration(ResumeSchema);
withDrafts(ResumeSchema);

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);