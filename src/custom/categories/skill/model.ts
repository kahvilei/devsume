// src/models/tag.ts
import {createCategoryModel, ICategory} from "@/server/models/Category";

export interface ISkill extends ICategory {
    description?: string; // appears on a skill's page under the title before listing relevant projects/job experience
}

export const Schema ={
    description: { type: String }
};

const Skill = createCategoryModel('Skill', Schema);

export default Skill;