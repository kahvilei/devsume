import mongoose from 'mongoose';
import {Link, LinkSchema} from '@/server/models/schemas/link';
import {IPost} from "@/server/models/Post";
import {Section, SectionSchema} from "@/server/models/schemas/section";
import {ICategory} from "@/server/models/Category";
import {withSlugGeneration} from "@/lib/models/withSlugGeneration";
import {withDrafts} from "@/lib/models/withDrafts";
import {withTimestamps} from "@/lib/models/withTimestamps";
import {Content, ContentBaseSchema} from "@/server/models/schemas/content";
import {withAutoCategories} from "@/lib/models/withAutoCategories";

export interface IResume extends Content {
    name: string;
    subtitle?: string;
    links?: Link[];
    about?: string;
    categories?: Section<ICategory>[];
    posts?: Section<IPost>[];
}

const ResumeSchema = new mongoose.Schema({
    ...ContentBaseSchema,
    name: { type: String, required: true },
    subtitle: { type: String },
    links: [LinkSchema],
    about: { type: String },
    categories: [SectionSchema],
    posts: [SectionSchema]
});

withTimestamps(ResumeSchema);
withSlugGeneration(ResumeSchema);
withDrafts(ResumeSchema);
withAutoCategories(ResumeSchema);

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);