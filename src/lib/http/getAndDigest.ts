import axios, {AxiosError} from "axios";
import {ResponseObject} from "@/lib/db/utils";

export const getAndDigest = async <T>(
    url: string,
    setData: (data: T) => void,
    setError: (error: string) => void,
    setWarning: (warning: string) => void
): Promise<void> => {
    try {
        const response = await axios.get<ResponseObject>(url);
        const { warning = "", error = "", content } = response.data;

        setWarning(warning);
        setError(error);

        if (content !== undefined) {
            setData(content as T);
        }
    } catch (e) {
        const error = e as AxiosError;
        setError(error.message);
    }
};

export const getAndReturn = async(
    url: string,
): Promise<ResponseObject> => {
    try {
        const response = await axios.get<ResponseObject>(url);
        return response.data;

    } catch (e) {
        const error = e as AxiosError;
        return {
            success: false,
            error: error.toString()
        }
    }
};
