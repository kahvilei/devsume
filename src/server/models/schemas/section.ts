import mongoose from 'mongoose';
import {DataEnum, DataQuery} from "@/server/models/schemas/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";


// Creating a schema definition that can be reused
export const SectionSchemaDefinition = {
    title: { type: String, required: true },
    type: { type: String, required: true },
    data: DataEnum
};

// Create the actual schema for use in other models
export const SectionSchema = new mongoose.Schema(SectionSchemaDefinition);

// Export a type interface for TypeScript
export interface Section<T extends IBaseItem>{
    type: string,
    data: T[] | DataQuery<T>
    title: string;
}