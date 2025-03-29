
import React from "react";

interface SearchInfoProps {
  totalResults: string;
  searchTime: string;
  query: string;
}

const SearchInfo: React.FC<SearchInfoProps> = ({ totalResults, searchTime, query }) => {
  return (
    <div className="text-sm text-gray-600 mt-1 mb-4">
      About {totalResults} results ({searchTime} seconds) for <span className="font-semibold">{query}</span>
    </div>
  );
};

export default SearchInfo;
