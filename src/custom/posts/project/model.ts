import mongoose from 'mongoose';
import { createPostModel, IPost } from "@/server/models/Post";
import { Section, SectionSchema } from "@/server/models/schemas/section";
import { ICollaborator } from "@/custom/categories/collaborator/model";

export interface IProject extends IPost {
    collaborators?: Section<ICollaborator>[];
    job?: mongoose.Types.ObjectId;
    githubUrl?: string;
}

const ProjectSchemaDefinition = {
    collaborators: [SectionSchema],
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience' },
    githubUrl: { type: String },
};

const ProjectAutoRefConfig = {
    'job': 'title company startDate endDate',
    'collaborators.items': 'name title avatar bio',
};

const Project = createPostModel('Project', ProjectSchemaDefinition, undefined, ProjectAutoRefConfig);

export default Project;