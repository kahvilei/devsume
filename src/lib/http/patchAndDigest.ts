import axios, {AxiosError} from "axios";
import {createFailResponse, ResponseObject} from "@/lib/db/utils";

export const patchAndDigest = async <T>(
    url: string,
    data: Partial<T>,
    setData: (data: T) => void,
    setError: (error: string) => void,
    setWarning: (warning: string) => void
): Promise<void> => {
    try {
        const response = await axios.patch<ResponseObject>(url, data);
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

export const patchAndReturn = async <T> (
    url: string,
    data: Partial<T>,
) => {
    try {
        const response = await axios.patch<ResponseObject>(url, data);
        return response.data;
    } catch (e) {
        const error = e as AxiosError;
        return createFailResponse(error.message);
    }
}
