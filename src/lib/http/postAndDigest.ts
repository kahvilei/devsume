import axios, {AxiosError} from "axios";
import {ResponseObject} from "@/lib/db/utils";

export const postAndDigest = async <T>(
    url: string,
    data: T,
    setData: (data: T) => void,
    setError: (error: string) => void,
    setWarning: (warning: string) => void
): Promise<void> => {
    try {
        const response = await axios.post<ResponseObject>(url, data);
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
