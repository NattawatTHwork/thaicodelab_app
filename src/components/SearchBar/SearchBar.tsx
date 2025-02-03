"use client";

import React from "react";

type SearchBarProps = {
  search: string;
  setSearch: (value: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {
  return (
    <input
      type="text"
      placeholder="Search all columns"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-1/2 px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
    />
  );
};

export default SearchBar;
