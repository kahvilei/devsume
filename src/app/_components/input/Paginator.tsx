import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { ActionIcon } from '@/app/_components/buttons/ActionIcon';

interface PaginatorProps {
    pages: number;
    currentPage?: number;
    onSelect: (page: number) => void;
    maxVisiblePages?: number;
}

export const Paginator: React.FC<PaginatorProps> = ({
                                                        pages,
                                                        currentPage = 0,
                                                        onSelect,
                                                        maxVisiblePages = 5
                                                    }) => {
    // Don't render if there's only one page or no pages
    if (pages <= 1) {
        return null;
    }

    const handlePageClick = (page: number) => {
        if (page >= 0 && page < pages && page !== currentPage) {
            onSelect(page);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 0) {
            onSelect(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < pages - 1) {
            onSelect(currentPage + 1);
        }
    };

    // Calculate which page numbers to show
    const getVisiblePages = (): (number | 'ellipsis')[] => {
        if (pages <= maxVisiblePages) {
            return Array.from({ length: pages }, (_, i) => i);
        }

        const half = Math.floor(maxVisiblePages / 2);
        let start = Math.max(0, currentPage - half);
        let end = Math.min(pages - 1, start + maxVisiblePages - 1);

        // Adjust start if we're near the end
        if (end - start < maxVisiblePages - 1) {
            start = Math.max(0, end - maxVisiblePages + 1);
        }

        const visiblePages: (number | 'ellipsis')[] = [];

        // Always show first page if not in visible range
        if (start > 0) {
            visiblePages.push(0);
            if (start > 1) {
                visiblePages.push('ellipsis');
            }
        }

        // Add visible page numbers
        for (let i = start; i <= end; i++) {
            visiblePages.push(i);
        }

        // Always show last page if not in visible range
        if (end < pages - 1) {
            if (end < pages - 2) {
                visiblePages.push('ellipsis');
            }
            visiblePages.push(pages - 1);
        }

        return visiblePages;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
            {/* Previous button */}
            <ActionIcon
                icon={<ChevronLeft size={16} />}
                onClick={handlePrevious}
                disabled={currentPage === 0}
                size="sm"
                tooltip="Previous page"
                className={currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            />

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {visiblePages.map((page, index) => {
                    if (page === 'ellipsis') {
                        return (
                            <div
                                key={`ellipsis-${index}`}
                                className="flex items-center justify-center w-8 h-8 text-gray-400"
                            >
                                <MoreHorizontal size={16} />
                            </div>
                        );
                    }

                    const isCurrentPage = page === currentPage;

                    return (
                        <button
                            key={page}
                            onClick={() => handlePageClick(page)}
                            className={`
                                flex items-center justify-center w-8 h-8 text-sm font-medium rounded-md
                                transition-colors duration-150 ease-in-out
                                ${isCurrentPage
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                            `}
                            aria-label={`Go to page ${page + 1}`}
                            aria-current={isCurrentPage ? 'page' : undefined}
                        >
                            {page + 1}
                        </button>
                    );
                })}
            </div>

            {/* Next button */}
            <ActionIcon
                icon={<ChevronRight size={16} />}
                onClick={handleNext}
                disabled={currentPage === pages - 1}
                size="sm"
                tooltip="Next page"
                className={currentPage === pages - 1 ? 'opacity-50 cursor-not-allowed' : ''}
            />

            {/* Page info */}
            <div className="ml-2 text-sm text-gray-600">
                Page {currentPage + 1} of {pages}
            </div>
        </div>
    );
};

export default Paginator;