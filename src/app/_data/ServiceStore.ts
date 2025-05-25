import { ItemService } from "./Items/ItemService";
import ITEMS, {ItemManifestList} from "@/config/items";
import { ICategory } from "@/server/models/Category";
import { IPost } from "@/server/models/Post";
import { IResume } from "@/server/models/Resume";
import { IMedia } from "@/server/models/Media";
import { IBaseItem as ItemInterface } from "@/server/models/schemas/IBaseItem";
import {Item} from "@/app/_data/Items/Item";

interface ServiceMap {
    categories: ItemService<ICategory>;
    posts: ItemService<IPost>;
    resumes: ItemService<IResume>;
    media: ItemService<IMedia>;
}

class ServiceStore {
    private readonly services: ServiceMap;
    private readonly items: ItemManifestList;


    constructor(items: ItemManifestList = ITEMS) {
        // Initialize services for each parent type
        this.services = {
            categories: new ItemService<ICategory>('categories', items.categories),
            posts: new ItemService<IPost>('posts', items.posts),
            resumes: new ItemService<IResume>('resumes', items.resumes),
            media: new ItemService<IMedia>('media', items.media)
        };
        this.items = items;
    }

    // Helper method to determine parent type from discriminator key
    private getParentTypeFromKey(key: string): keyof ServiceMap | null {
        // Check if it's a direct parent type
        if (key in this.services) {
            return key as keyof ServiceMap;
        }

        // Check discriminators
        for (const [parentKey, config] of Object.entries(this.items)) {
            if (config.discriminators) {
                for (const discriminator of config.discriminators) {
                    if (discriminator.key === key) {
                        return parentKey as keyof ServiceMap;
                    }
                }
            }
        }

        return null;
    }

    // Get API path for a specific discriminator or parent
    private getApiPath(key: string): string {
        // First check if it's a parent type
        if (key in this.items) {
            return this.items[key as keyof typeof ITEMS].api;
        }

        // Then check discriminators
        for (const config of Object.values(this.items)) {
            if (config.discriminators) {
                for (const discriminator of config.discriminators) {
                    if (discriminator.key === key && discriminator.api) {
                        return discriminator.api;
                    }
                }
            }
        }

        throw new Error(`No API path found for key: ${key}`);
    }

    // Get service by type
    getService(type: string): ItemService<IPost | ICategory | IMedia | IResume> {
        const parentType = this.getParentTypeFromKey(type);
        if (!parentType) {
            throw new Error(`Unknown type: ${type}`);
        }
        return this.services[parentType] as unknown as ItemService<IPost | ICategory | IMedia | IResume>;
    }


    // Get item by ID from any service
    getItemById(id: string): ItemInterface | undefined {
        for (const service of Object.values(this.services)) {
            const item = service.getItemById(id);
            if (item) {
                return item.getData();
            }
        }
        return undefined;
    }

    // Get IBaseItem instance by ID
    getItemInstanceById(id: string): Item | undefined {
        for (const service of Object.values(this.services)) {
            const item = service.getItemById(id);
            if (item) {
                return item;
            }
        }
        return undefined;
    }

    // Clear all caches across all services
    clearAllCaches() {
        for (const service of Object.values(this.services)) {
            service.clearAllCaches();
        }
    }

    // Get loading state across all services
    get isAnyLoading(): boolean {
        return Object.values(this.services).some(service => service.loading);
    }

    // Get errors from all services
    get errors(): { [key: string]: string | undefined } {
        const errors: { [key: string]: string | undefined } = {};
        for (const [key, service] of Object.entries(this.services)) {
            if (service.error) {
                errors[key] = service.error;
            }
        }
        return errors;
    }
}

// Export convenience methods
export const DataService = new ServiceStore();