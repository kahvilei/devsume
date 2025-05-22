import dbConnect from "@/lib/db/connect";
import {MongoServerError} from "mongodb";
import {DataQuery} from "@/server/models/schemas/data";

export interface ResponseObject {
    success: boolean,
    content?: object,
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
        content: responseObject
    }
}

export const createFailResponse = (error: unknown): ResponseObject => {
    return {
        success: false,
        error: error as string
    }
}

export const getMongooseParams = (query: URLSearchParams) => {
    // Handle sorting
    const sortParam = query.get('sort') || '';
    const sort: Record<string, 1 | -1> = {};

    if (sortParam) {
        // Support multiple sort fields: "name:asc,createdAt:desc"
        sortParam.split(',').forEach(sortItem => {
            const [field, direction] = sortItem.split(':');
            if (field) {
                sort[field] = direction?.toLowerCase() === 'desc' ? -1 : 1;
            }
        });
    }

    // Handle filters
    const filters: Record<string, Record<string, object | string | number>> = {};

    for (const [key, value] of query.entries()) {
        // Skip parameters used for pagination and sorting
        if (!['sort', 'limit', 'skip'].includes(key)) {
            // Support for operators (field.gt=10, field.in=1,2,3)
            if (key.includes('.')) {
                const [field, operator] = key.split('.');
                if (!filters[field]) filters[field] = {};

                const mongoOperator = {
                    'eq': '$eq', 'ne': '$ne', 'gt': '$gt', 'lt': '$lt',
                    'gte': '$gte', 'lte': '$lte', 'in': '$in', 'nin': '$nin',
                    'regex': '$regex'
                }[operator];

                if (mongoOperator) {
                    if (['$in', '$nin'].includes(mongoOperator)) {
                        filters[field][mongoOperator] = value.split(',');
                    } else if (mongoOperator === '$regex') {
                        filters[field][mongoOperator] = new RegExp(value, 'i');
                    } else {
                        // Try parsing as number if possible
                        filters[field][mongoOperator] = !isNaN(Number(value)) ? Number(value) : value;
                    }
                }
            } else {
                // Simple equality filter
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                filters[key] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }

    // Handle pagination
    const defaultLimit = 10;
    const maxLimit = 100; // Prevent excessive queries

    const requestedLimit = parseInt(query.get('limit') || String(defaultLimit), 10);
    const limit = Math.min(requestedLimit, maxLimit);
    const skip = parseInt(query.get('skip') || '0', 10);

    return { sort, filters, limit, skip };
};

// Format query for display
export const formatQuerySummary = <T>(query: DataQuery<T>): string => {
    const parts: string[] = [];

    if (query.filter && Object.keys(query.filter).length > 0) {
        const filterStr = Object.entries(query.filter)
            .map(([k, v]) => `${formatFieldName(k)}=${v}`)
            .join(', ');
        parts.push(`Filter: ${filterStr}`);
    }

    if (query.sort) {
        const [field, order] = query.sort.split(':');
        parts.push(`Sort: ${formatFieldName(field)} ${order === 'desc' ? '↓' : '↑'}`);
    }

    if (query.limit) {
        parts.push(`Limit: ${query.limit}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'No filters';
};

// Helper function to format field names for display
function formatFieldName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
}
