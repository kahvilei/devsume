import {getTagBySlug} from "@/server/actions/categories";
import { notFound } from "next/navigation";
import {ISkill} from "@/custom/categories/skill/model";

interface PageProps {
    params: {
        slug: string;
    };
}

export default async function TagPage({ params }: PageProps) {
    const skill = (await getTagBySlug(params.slug)).content as ISkill;

    if (!skill) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">{skill.title}</h1>
            {skill.description && (
                <div className="prose max-w-none">
                    <p>{skill.description}</p>
                </div>
            )}
        </main>
    );
}
