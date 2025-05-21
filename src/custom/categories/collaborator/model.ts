import mongoose from 'mongoose';
import {createCategoryModel, ICategory} from "@/models/Category";
import {LinkSchema} from "@/models/schemas/link";

export interface ICollaborator extends ICategory {
    description: string;
    img: string;
    links: [];
}

const CollaboratorSchema = new mongoose.Schema({
    description: { type: String },
    img: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    links: [LinkSchema]
});

const Collaborator = createCategoryModel('Collaborator', CollaboratorSchema);

export default Collaborator;