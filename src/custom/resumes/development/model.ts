import {Section, SectionSchema} from "@/server/models/schemas/section";
import {createResumeModel, IResume} from "@/server/models/Resume";
import {ISkill} from "@/custom/categories/skill/model";
import {IExperience} from "@/custom/posts/experience/model";
import {IProject} from "@/custom/posts/project/model";

export interface IDevelopmentResume extends IResume {
    skills?: Section<ISkill>[];
    experience?: Section<IExperience>[];
    projects?: Section<IProject>[];
}

export const Schema = {
    skills: [SectionSchema],
    experience: [SectionSchema],
    projects: [SectionSchema]
};

const Model = createResumeModel('Development', Schema);

export default Model;