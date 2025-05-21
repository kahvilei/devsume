// src/models/tag.ts
import mongoose from 'mongoose';
import {createCategoryModel, ICategory} from "@/models/Category";

export interface ISkill extends ICategory {
    description?: string;
}

const SkillSchema = new mongoose.Schema({
    description: { type: String }
});

const Skill = createCategoryModel('Skill', SkillSchema);

export default Skill;