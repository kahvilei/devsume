import {Document, Model} from "mongoose";

export const createModelResolver = <T extends Document>(
    defaultModel: Model<T>,
    customPath: string,
    modelCache: Map<string, object> = new Map()
) => {
    return async (type?: string): Promise<Model<T>> => {
        if (!type) return defaultModel;

        const cacheKey = `${customPath}/${type}`;

        if (modelCache.has(cacheKey)) {
            return (modelCache.get(cacheKey) as Model<T>)??defaultModel;
        }

        try {
            const customModel = (await import(`@/custom/${customPath}/${type}/model`)).default;
            modelCache.set(cacheKey, customModel);
            return customModel;
        } catch (e) {
            console.error(`Failed to import custom model for ${type}:`, e);
            // Cache the fallback as well to avoid repeated failed imports
            modelCache.set(cacheKey, defaultModel);
            return defaultModel;
        }
    };
};