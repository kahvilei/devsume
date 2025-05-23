import mongoose from 'mongoose';
import {Link, LinkSchema} from "@/server/models/schemas/link";
import {applyContentBehaviors, Content, ContentBaseSchema} from "@/server/models/schemas/content";
import {createModelFactory} from "@/lib/models/createModelFactory";

export interface IPost extends Content {
    content: string;
    link: string;
    useExternal: boolean; //if true, page is external, and we will not use content
    links?: Link[];
}

// Base Post schema that captures common fields
export const PostSchema = new mongoose.Schema({
    ...ContentBaseSchema,
    content: { type: String, required: true },
    link: { type: String, required: false },
    useExternal: { type: Boolean, default: false },
    links: [LinkSchema],
});

applyContentBehaviors(PostSchema);

export const createPostModel = createModelFactory('Post', PostSchema, applyContentBehaviors);

export default mongoose.models.Post || mongoose.model('Post', PostSchema);