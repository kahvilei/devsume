import mongoose from 'mongoose';
import {createCategoryModel} from "@/server/models/Category";
import {IMedia} from "@/server/models/Media";

export interface IImage extends IMedia {
    width?: string;
    height?: string;
}

const ImageSchema = new mongoose.Schema({
    width: { type: String },
    height: { type: String }
});

const Image = createCategoryModel('Image', ImageSchema);

export default Image;