import dbConnect from "@/lib/db/connect";
import {MongoServerError} from "mongodb";
import {createFailResponse, ResponseObject} from "@/lib/db/utils";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";


export const dbOperation = async (protect: boolean = true, operation: () => Promise<ResponseObject>):Promise<ResponseObject> => {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (protect) {
            if (!session?.user) return createFailResponse('Unauthorized');
        }
        return await operation();
    } catch (e) {
        console.error("Database operation failed:", e);
        return createFailResponse((e as unknown as MongoServerError).errorResponse.errmsg || 'Unknown error');
    }
};