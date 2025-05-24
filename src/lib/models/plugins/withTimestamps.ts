// Add timestamps to schema
import mongoose from "mongoose";

export const withTimestamps = (schema: mongoose.Schema) => {
    schema.add({
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    schema.pre('save', function(next) {
        this.updatedAt = new Date();
        next();
    });

    return schema;
};