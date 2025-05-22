import { ServiceFactory } from "@/lib/db/service-factory";
import { NextRequest, NextResponse } from "next/server";
import { PageProps } from "@/interfaces/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const createController = <TInterface>(
    service: ServiceFactory<TInterface>,
) => {
    return {
        get: async (request: NextRequest, { params }: PageProps) => {
            try {
                const query = request.nextUrl.searchParams;
                const type = (await params).type;
                const internalResponse = await service.get(query, type);
                return NextResponse.json(internalResponse);
            } catch (error) {
                console.error('GET error:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to fetch data' },
                    { status: 500 }
                );
            }
        },

        post: async (request: NextRequest, { params }: PageProps) => {
            try {
                const session = await getServerSession(authOptions); // Fixed: added await
                if (!session) return new Response('Unauthorized', { status: 401 });

                const document = await request.json();
                const type = (await params).type;
                const internalResponse = await service.add(document, type);
                return NextResponse.json(internalResponse);
            } catch (error) {
                console.error('POST error:', error);
                if (error instanceof SyntaxError) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid JSON in request body' },
                        { status: 400 }
                    );
                }
                return NextResponse.json(
                    { success: false, error: 'Failed to create resource' },
                    { status: 500 }
                );
            }
        },

        getBySlug: async (request: NextRequest, { params }: PageProps) => {
            try {
                const type = (await params).type;
                const slug = (await params).slug;

                if (!slug) {
                    return NextResponse.json(
                        { success: false, error: 'Slug parameter is required' },
                        { status: 400 }
                    );
                }

                const internalResponse = await service.getBySlug(slug, type);
                return NextResponse.json(internalResponse);
            } catch (error) {
                console.error('GET by slug error:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to fetch resource' },
                    { status: 500 }
                );
            }
        },

        patch: async (request: NextRequest, { params }: PageProps) => {
            try {
                const session = await getServerSession(authOptions); // Fixed: added await
                if (!session) return new Response('Unauthorized', { status: 401 });

                const type = (await params).type;
                const id = (await params).slug;

                if (!id) {
                    return NextResponse.json(
                        { success: false, error: 'ID parameter is required' },
                        { status: 400 }
                    );
                }

                const document = await request.json();
                const internalResponse = await service.update(id, document, type);
                return NextResponse.json(internalResponse);
            } catch (error) {
                console.error('PATCH error:', error);
                if (error instanceof SyntaxError) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid JSON in request body' },
                        { status: 400 }
                    );
                }
                return NextResponse.json(
                    { success: false, error: 'Failed to update resource' },
                    { status: 500 }
                );
            }
        },

        delete: async (request: NextRequest, { params }: PageProps) => {
            try {
                const session = await getServerSession(authOptions); // Fixed: added await
                if (!session) return new Response('Unauthorized', { status: 401 });

                const type = (await params).type;
                const id = (await params).slug;

                if (!id) {
                    return NextResponse.json(
                        { success: false, error: 'ID parameter is required' },
                        { status: 400 }
                    );
                }

                const internalResponse = await service.delete(id, type);
                return NextResponse.json(internalResponse);
            } catch (error) {
                console.error('DELETE error:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to delete resource' },
                    { status: 500 }
                );
            }
        }
    };
};