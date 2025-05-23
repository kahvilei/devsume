// src/models/tag.ts
import {createCategoryModel, ICategory} from "@/server/models/Category";

export interface ISkill extends ICategory {
    description?: string; // appears on a skill's page under the title before listing relevant projects/job experience
}

const SkillSchema ={
    description: { type: String }
};

const Skill = createCategoryModel('Skill', SkillSchema);

export default Skill;