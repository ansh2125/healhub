import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    // 👉 smart page range (avoid 100 buttons)
    const getPages = () => {
        const pages = [];
        const range = 2;

        let start = Math.max(1, currentPage - range);
        let end = Math.min(totalPages, currentPage + range);

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push("...");
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">

            {/* Prev */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-40"
            >
                <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>

            {/* Pages */}
            {getPages().map((page, i) =>
                page === "..." ? (
                    <span key={i} className="px-2 text-gray-500 text-sm">
                        ...
                    </span>
                ) : (
                    <button
                        key={i}
                        onClick={() => onPageChange(page)}
                        className={`
              min-w-[36px] h-9 px-2
              rounded-lg text-sm font-medium
              transition
              ${currentPage === page
                                ? "bg-indigo-500 text-white"
                                : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                            }
            `}
                    >
                        {page}
                    </button>
                )
            )}

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-40"
            >
                <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
        </div>
    );
};

export default Pagination;