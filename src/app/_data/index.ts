import {ItemService} from "@/app/_data/ItemService";
import ITEMS from "@/config/items";
import {DataType} from "@/server/models/schemas/data";

const CategoryService = new ItemService(ITEMS.categories)
const PostService = new ItemService(ITEMS.posts)
const ResumeService = new ItemService(ITEMS.resumes)

const getCustomServices = () => {
    const customServices: { [key: string]: ItemService<DataType> } = {};

    // Iterate through all items
    Object.values(ITEMS).forEach((itemConfig) => {
        // Check if item has discriminators
        if (itemConfig.discriminators && itemConfig.discriminators.length > 0) {
            // Create services for each discriminator
            itemConfig.discriminators.forEach((discriminator: { key: string | number; }) => {
                if (discriminator.key) {
                    // Create a new ItemService with merged config
                    const mergedConfig = {
                        ...itemConfig,
                        ...discriminator
                    };
                    customServices[discriminator.key] = new ItemService(mergedConfig);
                }
            });
        }
    });

    return customServices;
};


export const DataService = {
    categories: CategoryService,
    posts: PostService,
    resumes: ResumeService,
    ...getCustomServices()
}