export interface Item {
    _id?: string;
    slug?: string;
    title: string;
}

export const ItemBaseSchema = {
    slug: { type: String, unique:true, required: true },
    title: { type: String, required: true }
}