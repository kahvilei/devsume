import {DataQuery} from "@/server/models/schemas/data";
import {NextResponse} from "next/server";

export interface ResponseObject extends NextResponse {
    error?: string,
    warning?: string,
    status: number,
    content?: object,
    pagination?: {
        total: number,
        page: number,
        limit: number,
        pages: number
    }
}

export interface PagContent {
    total?: number,
    page?: number,
    limit?: number,
    skip?: number,
    pages?: number,
    hasMore?: boolean,
}

export const createSuccessResponse = (content: object, pagination:PagContent = {}, warning = ''): ResponseObject => {
    return NextResponse.json({
        warning,
        content,
        pagination
    })
}

export const createFailResponse = (error: unknown, status: number = 400): ResponseObject => {
    return NextResponse.json(
        {error: error},
        {status: status}
    )

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
export const formatQuerySummary = (query: DataQuery): string => {
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
