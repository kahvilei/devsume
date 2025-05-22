import { Category } from "@/server/models";
import { ICategory } from "@/server/models/Category";
import { createServiceFactory } from "@/lib/db/service-factory";
import {Document} from "mongoose";

const categoryService = createServiceFactory<Document, ICategory>(
    Category,
    "categories",
    "Category"
);

export default categoryService;

export const getAllCategories = categoryService.getAll;
export const getCategories = categoryService.get;
export const getCategoryBySlug = categoryService.getBySlug;
export const getCategoryById = categoryService.getById;
export const addCategory = categoryService.add;
export const updateCategory = categoryService.update;
export const deleteCategory = categoryService.delete;
export const addManyCategories = categoryService.addMany;
export const getCategoryCount = categoryService.getCount;
export const categoryExists = categoryService.exists;