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
    'job': {
        model: 'Experience',
        autoPopulate: false,
        populateSelect: 'title company startDate endDate'
    },
    'collaborators.items': {
        model: 'Collaborator',
        autoPopulate: false,
        populateSelect: 'name title avatar bio',
        deep: true // Enable deep searching since this is nested
    }
};

const Project = createPostModel('Project', ProjectSchemaDefinition, ProjectAutoRefConfig);

export default Project;