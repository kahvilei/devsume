export interface IBaseItem {
    _id?: string;
    slug?: string;
    title: string;
    tags?: string[];
    _t?: string;
}

export const ItemBaseSchema = {
    slug: { type: String, unique:true, required: true },
    title: { type: String, required: true },
    tags: { type: [String] }
}