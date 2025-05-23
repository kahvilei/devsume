import { Category } from "@/server/models";
import { ICategory } from "@/server/models/Category";
import { createServiceFactory } from "@/lib/db/service-factory";

const categoryService = createServiceFactory<ICategory>(
    Category,
    "categories",
    "Category"
);

export default categoryService;