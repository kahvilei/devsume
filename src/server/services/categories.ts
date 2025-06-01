import { Category } from "@/server/models";
import { ICategory } from "@/server/models/Category";
import { createServiceFactory } from "@/lib/db/service-factory";

const categoryService = await createServiceFactory<ICategory>(
    Category,
    "categories",
    "Category"
);

export default categoryService;