import mongoose from "mongoose";

// applying this will add a pre-save hook to the schema that searches for any references to object IDs of the category collection
// it then adds the found IDs to the category array, which is indexed for searching. optional pass-in config that tells
// auto categories where to search for categories. if provided, it will only search specified areas.
export const withAutoCategories = (schema: mongoose.Schema, config?: string[]) => {
    schema.add({
        _auto_categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
    })

    schema.pre('save', async function(next) {
        const categories = [];
        const depthSearchForCategories = (searchObject: object) => {
            if (searchObject) {
                if (searchObject instanceof mongoose.Schema.Types.ObjectId){
                    const found = mongoose.models.Category.findById(searchObject)
                    if (found) {
                        categories.push(found);
                    }
                }
                if (typeof searchObject === 'object') {
                    if (Array.isArray(searchObject)) {
                        for (const item of searchObject) {
                            depthSearchForCategories(item);
                        }
                    } else {
                        for (const key in searchObject) {
                            depthSearchForCategories(searchObject[key as keyof typeof searchObject]);
                        }
                    }
                }
            }
        }
        if (config && this !== undefined) {
            for (const c of config) {
                depthSearchForCategories(this[c] as object);
            }
        } else if (this !== undefined) {
            depthSearchForCategories(this as object);
        }
        next();
    })

    schema.index({ _auto_categories: 1 });

    return schema;
};