import {ServiceFactory} from "@/lib/db/service-factory";
import {NextRequest, NextResponse} from "next/server";
import {PageProps} from "@/interfaces/api";

export const createController = <TInterface>(
    service: ServiceFactory<TInterface>,
) => {

    return {
        get: async (request: NextRequest, { params }: PageProps) => {
            const query = request.nextUrl.searchParams;
            const type = (await params).type;
            const internalResponse = await service.get(query, type);
            return NextResponse.json(internalResponse);
        },

        post: async (request: NextRequest, { params }: PageProps) => {
            const document = await request.json();
            const type = (await params).type;
            const internalResponse = await service.add(document, type);
            return NextResponse.json(internalResponse);
        },

        getBySlug: async (request: NextRequest, { params }: PageProps) => {
            //id will be passed in the url
            const type = (await params).type;
            const slug = (await params).slug;
            const internalResponse = await service.getBySlug(slug, type);
            return NextResponse.json(internalResponse);
        },

        patch: async (request: NextRequest, { params }: PageProps) => {
            const type = (await params).type;
            const id = (await params).slug;
            const document = await request.json();
            const internalResponse = await service.update(id, document, type);
            return NextResponse.json(internalResponse);
        },

        delete: async (request: NextRequest, { params }: PageProps) => {
            const type = (await params).type;
            const id = (await params).slug;
            const internalResponse = await service.delete(id, type);
            return NextResponse.json(internalResponse);
        }

    };
};