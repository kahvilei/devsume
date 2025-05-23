import {createPostModel, IPost} from "@/server/models/Post";
import {Section, SectionSchema} from "@/server/models/schemas/section";
import {IProject} from "@/custom/posts/project/model";

export interface IExperience extends IPost {
    location: string;
    company: string;
    projects: Section<IProject>[]
}

export const Schema = {
    location: {type: String},
    company: {type: String},
    projects: [SectionSchema]
};

const Experience = createPostModel('Experience', Schema);

export default Experience;