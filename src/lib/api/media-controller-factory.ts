import {NextRequest} from "next/server";
import {PageProps} from "@/interfaces/api";
import {MediaServiceFactory} from "@/lib/db/media-service-factory";
import {IMedia} from "@/server/models/Media";
import {createFailResponse} from "@/lib/db/utils";
import {createController} from "@/lib/api/controller-factory";

export const createMediaController = <TInterface extends IMedia>(
    service: MediaServiceFactory<TInterface>
) => {
    // Helper function to extract file data from FormData
    const extractFileData = async (file: File) => {
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

    const baseFunctions = createController(service);

    return {

        get: baseFunctions.get,
        getBySlug: baseFunctions.getBySlug,

        delete: async (request: NextRequest, { params }: PageProps) => {
            try {
                const type = (await params).type;
                const id = (await params).slug;
                if (!id) {
                    return createFailResponse('ID parameter is required', 400);
                }
                return await service.deleteAndClean(id, type);
            } catch (error) {
                console.error('Delete error:', error);
            }
        },

        // Media-specific operations
        post: async (request: NextRequest, { params }: PageProps) => {
            try {
                const data = await request.formData();
                const type = (await params)?.type ?? undefined;
                if (!type) {
                    return createFailResponse('Type parameter is required', 400);
                }

                const formDataObj: Partial<TInterface> = {};
                data.forEach((value, key) => (formDataObj[(key as keyof TInterface)] =
                    value as typeof formDataObj[keyof TInterface] ?? undefined));
                const file = data.get('file');

                // Validate form data
                if (!file || (file as File)?.type === undefined) {
                    return createFailResponse('No file data provided or incorrect file format', 400);
                }

                return await service.uploadFile(await extractFileData(file as File), formDataObj, type);
            } catch (error) {
                console.error('Upload error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';
                return createFailResponse(errorMessage, 500);
            }
        },

        // Replace existing file or update data
        patch: async (request: NextRequest, { params }: PageProps) => {
            try {
                const data = await request.formData();
                const type = (await params)?.type ?? undefined;
                const id = (await params).slug;

                const formDataObj: Partial<TInterface> = {};
                data.forEach((value, key) => (formDataObj[(key as keyof TInterface)] =
                    value as typeof formDataObj[keyof TInterface] ?? undefined));

                const file = data.get('file');

                if (!file || (file as File)?.type === undefined) {
                    return await service.update(id, formDataObj, type);
                }

                if (!id) {
                    return createFailResponse('ID parameter is required', 400);
                }

                return await service.replaceFile(id, await extractFileData(file as File), type);
            } catch (error) {
                console.error('Replace file error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Replace failed';
                return createFailResponse(errorMessage, 500);
            }
        },
    };
};