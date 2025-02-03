"use client";

import React from "react";

type ItemsPerPageSelectorProps = {
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
};

const ItemsPerPageSelector: React.FC<ItemsPerPageSelectorProps> = ({ itemsPerPage, setItemsPerPage }) => {
  return (
    <div>
      <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600 dark:text-gray-400">
        Rows per page:
      </label>
      <select
        id="itemsPerPage"
        value={itemsPerPage}
        onChange={(e) => setItemsPerPage(Number(e.target.value))}
        className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  );
};

export default ItemsPerPageSelector;
