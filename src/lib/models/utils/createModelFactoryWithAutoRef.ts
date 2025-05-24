import mongoose from "mongoose";
import {AutoReferenceConfig} from "@/lib/models/plugins/withAutoRef";
import {createModelFactory} from "@/lib/models/utils/createModelFactory";

export const createModelFactoryWithAutoRef = <T = mongoose.Document>(
    baseModelName: string,
    baseSchema: mongoose.Schema,
    baseAutoRefConfig: AutoReferenceConfig = {},
    additionalBehaviors?: (schema: mongoose.Schema) => mongoose.Schema
) => {
    return createModelFactory<T>(
        baseModelName,
        baseSchema,
        (schema) => schema, // No base behaviors needed, handled by additionalBehaviors
        {
            autoRefConfig: baseAutoRefConfig,
            additionalBehaviors
        }
    );
};