import {getTagBySlug} from "@/actions/tags";
import { notFound } from "next/navigation";
import {ITag} from "@/models/categories/Tag";

interface PageProps {
    params: {
        slug: string;
    };
}

export default async function TagPage({ params }: PageProps) {
    const tag = (await getTagBySlug(params.slug)).content as ITag;

    if (!tag) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">{tag.title}</h1>
            {tag.description && (
                <div className="prose max-w-none">
                    <p>{tag.description}</p>
                </div>
            )}
        </main>
    );
}
