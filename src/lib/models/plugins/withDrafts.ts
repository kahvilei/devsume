import mongoose from "mongoose";

export const withDrafts = (schema: mongoose.Schema, limit: number = 20) => {
    schema.add({
        drafts: {
            type: [schema]
        }
    })
    schema.pre('save', function(next) {
        if (!this.drafts) return next();
        if (!Array.isArray(this.drafts)) return next();

        this.drafts.push(this.toObject());
        this.drafts = (this.drafts as []).slice(0, limit);

        next();
    })
};