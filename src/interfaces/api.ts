export interface PageProps {
    params: Promise<{ slug: string }> // <- the same "slug" and any other segments
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
