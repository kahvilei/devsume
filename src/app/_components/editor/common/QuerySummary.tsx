import React from 'react';

interface QuerySummaryProps {
    filterCount: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    limit?: number;
    className?: string;
}

export const QuerySummary: React.FC<QuerySummaryProps> = ({
                                                              filterCount,
                                                              sortField,
                                                              sortDirection,
                                                              limit,
                                                              className = ''
                                                          }) => {
    // Format field name for display
    const formatFieldName = (name: string): string => {
        return name?.charAt(0).toUpperCase() + name?.slice(1).replace(/([A-Z])/g, ' $1');
    };

    // Check if any filters exist
    const hasFilters = filterCount > 0;
    const hasSort = sortField && sortDirection;
    const hasLimit = typeof limit === 'number';
    const hasAnyFilter = hasFilters || hasSort || hasLimit;

    return (
        <div className={`query-summary ${className}`}>
            {hasAnyFilter ? (
                <>
                    {hasFilters && (
                        <span className="query-summary-item">
                            <span className="query-summary-count">{filterCount}</span>
                            <span className="query-summary-label">filters</span>
                        </span>
                    )}

                    {hasSort && (
                        <span className="query-summary-item">
                            <span className="query-summary-icon">
                                {sortDirection === 'desc' ? '↓' : '↑'}
                            </span>
                            <span className="query-summary-label">
                                {formatFieldName(sortField)} ({sortDirection})
                            </span>
                        </span>
                    )}

                    {hasLimit && (
                        <span className="query-summary-item">
                            <span className="query-summary-count">{limit}</span>
                            <span className="query-summary-label">limit</span>
                        </span>
                    )}
                </>
            ) : (
                <span className="query-summary-empty">No filters applied</span>
            )}
        </div>
    );
};