import {createPostModel} from "@/models/Post";
import mongoose from "mongoose";

export const ExperienceSchema = {
    location: {type: String},
    company: {type: String},
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}]
};

const Experience = createPostModel('Experience', ExperienceSchema);

export default Experience;