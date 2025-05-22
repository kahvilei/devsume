import dbConnect from "@/lib/db/connect";
import { MongoServerError } from "mongodb";
import { createFailResponse, ResponseObject } from "@/lib/db/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dbOperation = async (
    protect: boolean = true,
    operation: () => Promise<ResponseObject>
): Promise<ResponseObject> => {
    try {
        await dbConnect();

        if (protect) {
            const session = await getServerSession(authOptions);
            if (!session?.user) {
                return createFailResponse('Unauthorized', 401);
            }
        }

        return await operation();
    } catch (e) {
        console.error("Database operation failed:", e);

        // Better error handling
        if (e instanceof MongoServerError) {
            const errorMessage = e.errorResponse?.errmsg || e.message || 'Database error';
            // MongoDB duplicate key error code is 11000
            const statusCode = e.code === 11000 ? 409 : 500;
            return createFailResponse(errorMessage, statusCode);
        }

        if (e instanceof Error) {
            // Check for specific error types
            if (e.name === 'ValidationError') {
                return createFailResponse(e.message, 400);
            }
            if (e.name === 'CastError') {
                return createFailResponse('Invalid data format', 400);
            }
            return createFailResponse(e.message, 500);
        }

        return createFailResponse('An unexpected error occurred', 500);
    }
};