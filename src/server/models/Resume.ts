import mongoose from 'mongoose';
import {Link, LinkSchema} from '@/server/models/schemas/link';
import {applyContentBehaviors, Content, ContentBaseSchema} from "@/server/models/schemas/content";
import {createModelFactory} from "@/lib/models/utils/createModelFactory";

export interface IResume extends Content {
    name: string;
    subtitle?: string;
    links?: Link[];
    about?: string;
}

export const ResumeSchemaDefinition = {
    ...ContentBaseSchema,
    name: { type: String, required: true },
    subtitle: { type: String },
    links: [LinkSchema],
    about: { type: String },
};

const ResumeSchema = new mongoose.Schema(ResumeSchemaDefinition);

//Creates a "discriminator" on the Resume model allowing for custom Resume types that inherit from the base Post model
//This should be the default export of a model.ts file under custom/resumes/[YOUR_RESUME_TYPE].
//customBehaviours callback can be applied to add custom schema functions for validation, on delete, etc.
export const createResumeModel = createModelFactory('Resume',
    ResumeSchema,
    applyContentBehaviors);

applyContentBehaviors(ResumeSchema);

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);