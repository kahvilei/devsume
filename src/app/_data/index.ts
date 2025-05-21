import {ItemService} from "@/app/_data/ItemService";
import ITEMS from "@/config/items";

const CategoryService = new ItemService(ITEMS.categories)

export const DataService = {
    categories: CategoryService
}