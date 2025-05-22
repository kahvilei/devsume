import { NextRequest, NextResponse } from "next/server";
import { PageProps } from "@/interfaces/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MediaServiceFactory } from "@/lib/db/media-service-factory";
import { IMedia } from "@/server/models/Media";

export const createMediaController = <TInterface extends IMedia>(
    service: MediaServiceFactory<TInterface>
) => {
    // Helper function to extract file data from FormData
    const extractFileFromFormData = async (formData: FormData) => {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file provided');
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        return {
            buffer,
            originalname: file.name,
            mimetype: file.type,
            size: file.size
        };
    };

    // Helper function to extract multiple files from FormData
    const extractFilesFromFormData = async (formData: FormData) => {
        const files: Array<{ buffer: Buffer; originalname: string; mimetype: string; size: number }> = [];

        for (const [key, value] of formData.entries()) {
            if (value instanceof File && key.startsWith('file')) {
                const buffer = Buffer.from(await value.arrayBuffer());
                files.push({
                    buffer,
                    originalname: value.name,
                    mimetype: value.type,
                    size: value.size
                });
            }
        }

        return files;
    };

    // Helper function to extract metadata from FormData
    const extractMetadataFromFormData = (formData: FormData): {
        title?: string;
        alt?: string;
        caption?: string;
        description?: string;
        tags?: string[];
    } => {
        const metadata: {
            title?: string;
            alt?: string;
            caption?: string;
            description?: string;
            tags?: string[];
        } = {};

        for (const [key, value] of formData.entries()) {
            if (key !== 'file' && !key.startsWith('file') && typeof value === 'string') {
                if (key === 'tags') {
                    // Handle tags as array
                    metadata.tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
                } else if (key === 'title' || key === 'alt' || key === 'caption' || key === 'description') {
                    metadata[key] = value;
                }
            }
        }

        return metadata;
    };

    return {
        // Standard CRUD operations
        get: async (request: NextRequest, { params }: PageProps) => {
            try {
                const query = request.nextUrl.searchParams;
                const type = (await params).type;
                const internalResponse = await service.get(query, type);
                return NextResponse.json(internalResponse);
            } catch (error) {
                console.error('GET error:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to fetch media' },
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
                return NextResponse.json(
                    { success: false, error: 'Failed to create media' },
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
                    { success: false, error: 'Failed to fetch media' },
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
                return NextResponse.json(
                    { success: false, error: 'Failed to update media' },
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
                    { success: false, error: 'Failed to delete media' },
                    { status: 500 }
                );
            }
        },

        // Media-specific operations
        upload: async (request: NextRequest, { params }: PageProps) => {
            try {
                const session = await getServerSession(authOptions); // Fixed: added await
                if (!session) return new Response('Unauthorized', { status: 401 });

                const contentType = request.headers.get('content-type') || '';
                if (!contentType.includes('multipart/form-data')) {
                    return NextResponse.json(
                        { success: false, error: 'Content-Type must be multipart/form-data' },
                        { status: 400 }
                    );
                }

                const formData = await request.formData();
                const type = (await params)?.type;

                // Validate form data
                if (!formData || Array.from(formData.entries()).length === 0) {
                    return NextResponse.json(
                        { success: false, error: 'No form data provided' },
                        { status: 400 }
                    );
                }

                // Extract metadata from form data
                const metadata = extractMetadataFromFormData(formData);

                // Check if it's single or multiple file upload
                const files = await extractFilesFromFormData(formData);

                let internalResponse;
                if (files.length === 1) {
                    internalResponse = await service.uploadFile(files[0], metadata, type);
                } else if (files.length > 1) {
                    internalResponse = await service.uploadFiles(files, metadata, type);
                } else {
                    return NextResponse.json(
                        { success: false, error: 'No files provided' },
                        { status: 400 }
                    );
                }

                return NextResponse.json(internalResponse);
            } catch (error) {
                console.error('Upload error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';
                return NextResponse.json(
                    { success: false, error: errorMessage },
                    { status: 500 }
                );
            }
        },

        // Replace existing file
        replace: async (request: NextRequest, { params }: PageProps) => {
            try {
                const session = await getServerSession(authOptions); // Fixed: added await
                if (!session) return new Response('Unauthorized', { status: 401 });

                const contentType = request.headers.get('content-type') || '';
                if (!contentType.includes('multipart/form-data')) {
                    return NextResponse.json(
                        { success: false, error: 'Content-Type must be multipart/form-data' },
                        { status: 400 }
                    );
                }

                const formData = await request.formData();
                const type = (await params)?.type;
                const id = (await params).slug;

                if (!id) {
                    return NextResponse.json(
                        { success: false, error: 'ID parameter is required' },
                        { status: 400 }
                    );
                }

                const file = await extractFileFromFormData(formData);
                const internalResponse = await service.replaceFile(id, file, type);

                return NextResponse.json(internalResponse);
            } catch (error) {
                console.error('Replace file error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Replace failed';
                return NextResponse.json(
                    { success: false, error: errorMessage },
                    { status: 500 }
                );
            }
        },

        // Get media with thumbnail URLs
        getWithThumbnails: async (request: NextRequest, { params }: PageProps) => {
            try {
                const type = (await params)?.type;
                const id = (await params).slug;

                if (!id) {
                    return NextResponse.json(
                        { success: false, error: 'ID parameter is required' },
                        { status: 400 }
                    );
                }

                const internalResponse = await service.getWithThumbnails(id, type);
                return NextResponse.json(internalResponse);
            } catch (error) {
                console.error('Get with thumbnails error:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to fetch media with thumbnails' },
                    { status: 500 }
                );
            }
        },

        // Batch upload helper
        uploadBatch: async (request: NextRequest, { params }: PageProps) => {
            try {
                const session = await getServerSession(authOptions); // Fixed: added await
                if (!session) return new Response('Unauthorized', { status: 401 });

                const contentType = request.headers.get('content-type') || '';
                if (!contentType.includes('multipart/form-data')) {
                    return NextResponse.json(
                        { success: false, error: 'Content-Type must be multipart/form-data' },
                        { status: 400 }
                    );
                }

                const formData = await request.formData();
                const type = (await params)?.type;

                const metadata = extractMetadataFromFormData(formData);
                const files = await extractFilesFromFormData(formData);

                if (files.length === 0) {
                    return NextResponse.json(
                        { success: false, error: 'No files provided' },
                        { status: 400 }
                    );
                }

                const internalResponse = await service.uploadFiles(files, metadata, type);
                return NextResponse.json(internalResponse);
            } catch (error) {
                console.error('Batch upload error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Batch upload failed';
                return NextResponse.json(
                    { success: false, error: errorMessage },
                    { status: 500 }
                );
            }
        }
    };
};