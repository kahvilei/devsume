import {ItemService} from "@/app/_data/ItemService";
import ITEMS from "@/config/itemConfig";

const TagService = new ItemService(ITEMS.tags)

export const DataService = {
    tags: TagService
}