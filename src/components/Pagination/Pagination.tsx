"use client";

import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, handlePageChange }) => {
  const getPaginationRange = () => {
    const range: number[] = [];
    const start = Math.max(currentPage - 2, 1);
    const end = Math.min(currentPage + 2, totalPages);
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-white disabled:opacity-50"
        >
          &lt;
        </button>
        {getPaginationRange().map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-white disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
