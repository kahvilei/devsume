import mongoose from "mongoose";
import { ICategory } from "@/server/models/Category";

interface CategoryDocumentLike {
    _id: mongoose.Types.ObjectId | string;
    constructor?: {
        modelName?: string;
    };
}

type SearchableValue =
    | string
    | number
    | boolean
    | Date
    | mongoose.Types.ObjectId
    | CategoryDocumentLike
    | SearchableObject
    | SearchableArray
    | null
    | undefined;

interface SearchableObject {
    [key: string]: SearchableValue;
}

type SearchableArray = Array<SearchableValue>

export const withAutoCategories = (schema: mongoose.Schema, config?: string[]) => {
    schema.add({
        _auto_categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
    });

    schema.pre('save', async function(next) {
        try {
            const potentialCategoryIds = new Set<string>();
            const processedObjects = new WeakSet<object>();

            const collectPotentialCategories = (searchObject: SearchableValue): void => {
                if (!searchObject || (typeof searchObject === 'object' && processedObjects.has(searchObject))) {
                    return;
                }

                if (typeof searchObject === 'object') {
                    processedObjects.add(searchObject);
                }

                if (searchObject instanceof mongoose.Types.ObjectId) {
                    potentialCategoryIds.add(searchObject.toString());
                } else if (searchObject instanceof mongoose.models.Category) {
                    const categoryDoc = searchObject as ICategory;
                    potentialCategoryIds.add((categoryDoc as ICategory)._id??"".toString());
                } else if (typeof searchObject === 'string' && mongoose.Types.ObjectId.isValid(searchObject)) {
                    potentialCategoryIds.add(searchObject);
                } else if (typeof searchObject === 'object') {
                    if (Array.isArray(searchObject)) {
                        const searchArray = searchObject as SearchableArray;
                        for (const item of searchArray) {
                            collectPotentialCategories(item);
                        }
                    } else {
                        const searchObj = searchObject as SearchableObject;
                        for (const key in searchObj) {
                            if (searchObj.hasOwnProperty(key)) {
                                collectPotentialCategories(searchObj[key]);
                            }
                        }
                    }
                }
            };

            // Collect all potential category IDs
            if (config && config.length > 0) {
                for (const fieldName of config) {
                    const fieldValue = this[fieldName] as SearchableValue;
                    if (fieldValue !== undefined) {
                        collectPotentialCategories(fieldValue);
                    }
                }
            } else {
                const docObj = this.toObject() as SearchableObject;
                delete docObj._auto_categories;
                collectPotentialCategories(docObj);
            }

            // Batch query to check which IDs are actually categories
            let validCategoryIds: string[] = [];
            if (potentialCategoryIds.size > 0) {
                const objectIds = Array.from(potentialCategoryIds).map(id => new mongoose.Types.ObjectId(id));
                const foundCategories = await mongoose.models.Category.find(
                    { _id: { $in: objectIds } },
                    { _id: 1 }
                ).lean();

                validCategoryIds = foundCategories.map((cat) => cat._id?.toString()??"");
            }

            // Assign valid category IDs to _auto_categories
            this._auto_categories = validCategoryIds.map(id => new mongoose.Types.ObjectId(id));

            next();
        } catch (error) {
            next(error as Error);
        }
    });

    schema.index({ _auto_categories: 1 });

    return schema;
};