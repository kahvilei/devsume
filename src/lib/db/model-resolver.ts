import {Document, Model, PopulateOptions} from "mongoose";
import {readdirSync, statSync} from "fs";
import {join} from "path";
import { resolve } from "path";


export const createModelResolver = async<T extends Document> (
    defaultModel: Model<T>,
    customPath: string,
    modelCache: Map<string, Model<T>> = new Map(),
    popFields: PopulateOptions[]
) => {
    // Preload all directories in the customPath
    const preloadModels = async () => {
        try {
            const absoluteCustomPath = resolve(process.cwd(), "src", "custom", customPath);
            const directories = readdirSync(absoluteCustomPath).filter((dir) =>
                statSync(join(absoluteCustomPath, dir)).isDirectory()
            );

            for (const directory of directories) {
                const cacheKey = `${customPath}/${directory}`;

                try {
                    // Dynamically import the model and cache it
                    const {model, populateOptions} = (await import(`@/custom/${customPath}/${directory}/model`)).default;
                    for (const option of populateOptions) {
                        option.strictPopulate = false;
                        popFields.push(option);
                    }
                    modelCache.set(cacheKey, model);
                } catch (e) {
                    console.error(
                        `Failed to preload model for directory ${directory}:`,
                        e
                    );
                    // Cache the fallback model for the directory if preloading fails
                    modelCache.set(cacheKey, defaultModel);
                }
            }
        } catch (e) {
            console.error("Failed to preload models:", e);
        }
    };

    // Run the preload at the time of resolver initialization
    await preloadModels();

    return async (type?: string): Promise<Model<T>> => {
        if (!type) return defaultModel;

        const cacheKey = `${customPath}/${type}`;

        if (modelCache.has(cacheKey)) {
            return modelCache.get(cacheKey) as Model<T>;
        }

        try {
            const {model, populateOptions} = (await import(`@/custom/${customPath}/${type}/model`)).default;
            for (const option of populateOptions) {
                option.strictPopulate = false;
                popFields.push(option);
            }
            modelCache.set(cacheKey, model);
            return model;
        } catch (e) {
            console.error(`Failed to import custom model for ${type}:`, e);
            // Cache the fallback to avoid repeated failed imports
            modelCache.set(cacheKey, defaultModel);
            return defaultModel;
        }
    };
};
