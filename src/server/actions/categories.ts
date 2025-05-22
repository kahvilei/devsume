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