import { ServiceFactory } from "@/lib/db/service-factory";
import { NextRequest, NextResponse } from "next/server";
import { PageProps } from "@/interfaces/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BaseDataModel } from "@/interfaces/data";
import { createFailResponse } from "@/lib/db/utils";

export const createController = <TInterface extends BaseDataModel>(
    service: ServiceFactory<TInterface>,
) => {
    return {
        get: async (request: NextRequest, { params }: PageProps) => {
            try {
                const query = request.nextUrl.searchParams;
                const type = (await params).type;
                return await service.get(query, type);
            } catch (error) {
                console.error('GET error:', error);
                return createFailResponse('Failed to fetch data', 500);
            }
        },

        post: async (request: NextRequest, { params }: PageProps) => {
            try {
                const session = await getServerSession(authOptions);
                if (!session) {
                    return createFailResponse('Unauthorized', 401);
                }

                const document = await request.json();
                const type = (await params).type;
                return await service.add(document, type);
            } catch (error) {
                console.error('POST error:', error);
                if (error instanceof SyntaxError) {
                    return createFailResponse('Invalid JSON in request body', 400);
                }
                return createFailResponse('Failed to create resource', 500);
            }
        },

        getBySlug: async (request: NextRequest, { params }: PageProps) => {
            try {
                const type = (await params).type;
                const slug = (await params).slug;

                if (!slug) {
                    return createFailResponse('Slug parameter is required', 400);
                }

                return await service.getBySlug(slug, type);
            } catch (error) {
                console.error('GET by slug error:', error);
                return createFailResponse('Failed to fetch resource', 500);
            }
        },

        patch: async (request: NextRequest, { params }: PageProps) => {
            try {
                const session = await getServerSession(authOptions);
                if (!session) {
                    return createFailResponse('Unauthorized', 401);
                }

                const type = (await params).type;
                const id = (await params).slug;

                if (!id) {
                    return createFailResponse('ID parameter is required', 400);
                }

                const document = await request.json();
                return await service.update(id, document, type);
            } catch (error) {
                console.error('PATCH error:', error);
                if (error instanceof SyntaxError) {
                    return createFailResponse('Invalid JSON in request body', 400);
                }
                return createFailResponse('Failed to update resource', 500);
            }
        },

        delete: async (request: NextRequest, { params }: PageProps) => {
            try {
                const session = await getServerSession(authOptions);
                if (!session) {
                    return createFailResponse('Unauthorized', 401);
                }

                const type = (await params).type;
                const id = (await params).slug;

                if (!id) {
                    return createFailResponse('ID parameter is required', 400);
                }

                return await service.delete(id, type);
            } catch (error) {
                console.error('DELETE error:', error);
                return createFailResponse('Failed to delete resource', 500);
            }
        }
    };
};