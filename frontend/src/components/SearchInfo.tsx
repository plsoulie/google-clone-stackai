
import React from "react";

interface SearchInfoProps {
  totalResults: string;
  searchTime: string;
  query: string;
}

const SearchInfo: React.FC<SearchInfoProps> = ({ totalResults, searchTime, query }) => {
  return (
    <div className="bg-gray-200 rounded-lg p-3 mt-3 mb-4 inline-block max-w-[80%] text-sm text-gray-700">
      About {totalResults} results ({searchTime} seconds) for <span className="font-semibold">{query}</span>
    </div>
  );
};

export default SearchInfo;
