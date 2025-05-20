import {DataQuery} from "@/interfaces/api";

export const convertQueryToString = <T>(query: DataQuery<T>) => {
    let queryStr = "?";
    for (const key in query) {
        if (query.hasOwnProperty(key) && key !== "filter") {
            const value = query[key as keyof DataQuery<T>];
            queryStr += `${key}=${value}&`;
        } else if (query.hasOwnProperty(key) && key === "filter") {
            for (const filterKey in query.filter) {
                const value = query.filter[filterKey];
                queryStr += `${filterKey}=${value}&`;
            }
        }
    }
    return queryStr.slice(0, -1);
}

export const convertStringToQuery = <T>(query: string) => {
    return query.slice(1).split("&").reduce((acc, curr) => {
        const [key, value] = curr.split("=");
        if (key === "filter") {
            acc.filter = {
                ...acc.filter,
                [value]: []
            }
        } else {
            if (key === 'sort') {
                acc.sort = value;
            } else if (key === 'limit') {
                acc.limit = parseInt(value);
            }
        }
        return acc;
    }, {} as DataQuery<T>);
}