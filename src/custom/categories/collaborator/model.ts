import mongoose from 'mongoose';
import {createCategoryModel, ICategory} from "@/server/models/Category";
import {Link, LinkSchema} from "@/server/models/schemas/link";

export interface ICollaborator extends ICategory {
    description: string;
    img: string;
    links: Link[];
}

const CollaboratorSchema = {
    description: { type: String },
    img: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    links: [LinkSchema]
};

const Collaborator = createCategoryModel('Collaborator', CollaboratorSchema);

export default Collaborator;