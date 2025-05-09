export interface PageProps {
    params: Promise<{ slug: string }> // <- the same "slug" and any other segments
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export interface DataQuery<T> {
    filter?: {
        [K in keyof T]?: string;
    }
    sort?: string;
    limit?: number;
}