import mongoose from 'mongoose';
import {Link, LinkSchema} from '@/server/models/schemas/link';
import {IPost} from "@/server/models/Post";
import {Section, SectionSchema} from "@/server/models/schemas/section";
import {ICategory} from "@/server/models/Category";
import {applyContentBehaviors, Content, ContentBaseSchema} from "@/server/models/schemas/content";
import {createModelFactory} from "@/lib/models/createModelFactory";

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

applyContentBehaviors(ResumeSchema);

//Creates a "discriminator" on the Resume model allowing for custom Resume types that inherit from the base Post model
//This should be the default export of a model.ts file under custom/resumes/[YOUR_RESUME_TYPE].
//customBehaviours callback can be applied to add custom schema functions for validation, on delete, etc.
export const createResumeModel = createModelFactory('Resume', ResumeSchema, applyContentBehaviors);

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);