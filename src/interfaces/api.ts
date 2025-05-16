export interface PageProps {
    params: Promise<{ slug: string }> // <- the same "slug" and any other segments
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export type DataFilter = string | number | string[] | number[];

export interface DataQuery<T> {
    filter?: {
        [K in keyof T]?: DataFilter[];
    }
    sort?: string;
    limit?: number;
}