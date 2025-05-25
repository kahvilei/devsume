import axios, {AxiosError} from "axios";
import {createFailResponse, ResponseObject} from "@/lib/db/utils";

export const deleteAndDigest = async <T>(
    url: string,
    setData: (data: T) => void,
    setError: (error: string) => void,
    setWarning: (warning: string) => void
): Promise<void> => {
    try {
        const response = await axios.delete<ResponseObject>(url);
        const {warning = "", error = "", content} = response.data;

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


export const deleteAndReturn = async (url: string): Promise<ResponseObject> => {
    try {
        const response = await axios.delete<ResponseObject>(url);
        return response.data;
    } catch (e) {
        const error = e as AxiosError;
        return createFailResponse(error.message);
    }
}