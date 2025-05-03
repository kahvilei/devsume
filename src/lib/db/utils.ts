import dbConnect from "@/lib/db/connect";
import {MongoServerError} from "mongodb";

export interface ResponseObject {
    success: boolean,
    response?: object,
    error?: string,
    warning?: string,
}

export const dbOperation = async (operation: () => Promise<ResponseObject>):Promise<ResponseObject> => {
    try {
        await dbConnect();
        return await operation();
    } catch (e) {
        console.error("Database operation failed:", e);
        return createFailResponse((e as unknown as MongoServerError).errorResponse.errmsg || 'Unknown error');
    }
};

export const createSuccessResponse = (responseObject: object, warning = ''): ResponseObject => {
    return {
        success: true,
        warning: warning,
        response: responseObject
    }
}

export const createFailResponse = (error: unknown): ResponseObject => {
    return {
        success: false,
        error: error as string
    }
}

