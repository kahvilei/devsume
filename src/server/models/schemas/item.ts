export interface Item {
    _id?: string;
    slug?: string;
    title: string;
    tags?: string[];
}

export const ItemBaseSchema = {
    slug: { type: String, unique:true, required: true },
    title: { type: String, required: true },
    tags: { type: [String] }
}