import {createMediaModel, IMedia} from "@/server/models/Media";

export interface IImage extends IMedia {
    width?: string;
    height?: string;
}

export const Schema = {
    width: { type: String },
    height: { type: String }
};

const Image = createMediaModel('Image', Schema);

export default Image;