import mongoose from 'mongoose';
import {createPostModel, IPost} from "@/server/models/Post";
import {Section, SectionSchema} from "@/server/models/schemas/section";
import {ICollaborator} from "@/custom/categories/collaborator/model";

export interface IProject extends IPost {
    collaborators?: Section<ICollaborator>[];
    job?: string;
    githubUrl?: string;
}

const Schema = {
    collaborators: [SectionSchema],
    job: {type: mongoose.Schema.Types.ObjectId, ref: 'IExperience'},
    githubUrl: {type: String},
};

const Project = createPostModel('Project', Schema);

export default Project;