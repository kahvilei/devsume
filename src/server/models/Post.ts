import mongoose from 'mongoose';
import {Link, LinkSchema} from "@/server/models/schemas/link";
import {applyContentBehaviors, Content, ContentBaseSchema} from "@/server/models/schemas/content";
import {createModelFactoryWithAutoRef} from "@/lib/models/utils/createModelFactoryWithAutoRef";

export interface IPost extends Content {
    content: string;
    link: string;
    useExternal: boolean; //if true, page is external, and we will not use content
    links?: Link[];
}

// Base Post schema that captures common fields
export const PostSchemaDefinition = {
    ...ContentBaseSchema,
    content: { type: String, required: true },
    link: { type: String, required: false },
    useExternal: { type: Boolean, default: false },
    links: [LinkSchema],
};

const PostSchema = new mongoose.Schema(PostSchemaDefinition);

//Creates a "discriminator" on the Post model allowing for custom Post types that inherit from the base Post model
//This should be the default export of a model.ts file under custom/posts/[YOUR_POST_TYPE].
//customBehaviours callback can be applied to add custom schema functions for validation, on delete, etc.
export const createPostModel = createModelFactoryWithAutoRef(
    'Post',
    PostSchema,
    {},
    applyContentBehaviors
);

applyContentBehaviors(PostSchema);

export default mongoose.models.Post || mongoose.model('Post', PostSchema);