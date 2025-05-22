import mongoose from 'mongoose';
import {createPostModel} from "@/server/models/Post";

const ProjectSchema = {
    collaborators: [{type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator'}],
    job: {type: mongoose.Schema.Types.ObjectId, ref: 'Experience'},
    githubUrl: {type: String},
};

const Project = createPostModel('Project', ProjectSchema);

export default Project;