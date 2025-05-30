import mongoose from 'mongoose';
import {createCategoryModel, ICategory} from "@/server/models/Category";
import {Link, LinkSchema} from "@/server/models/schemas/link";
import {IImage} from "@/custom/media/image/model";

export interface ICollaborator extends ICategory {
    description: string;
    img: IImage;
    links: Link[];
}

export const Schema = {
    description: { type: String },
    img: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    links: [LinkSchema]
};

const CollaboratorAutoRefConfig = {
    'img': {
        model: 'Image',
        autoPopulate: true,
        populateSelect: 'url _id'
    },
};

const Collaborator = createCategoryModel('Collaborator', Schema,undefined, CollaboratorAutoRefConfig);

export default Collaborator;