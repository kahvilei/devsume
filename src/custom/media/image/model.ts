import mongoose from 'mongoose';
import {createMediaModel, IMedia} from "@/server/models/Media";

export interface IImage extends IMedia {
    width?: string;
    height?: string;
}

const ImageSchema = new mongoose.Schema({
    width: { type: String },
    height: { type: String }
});

const Image = createMediaModel('Image', ImageSchema);

export default Image;