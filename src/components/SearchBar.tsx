
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = "", onSearch }) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
      <div className="relative flex items-center">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Google or type a URL"
          className="pr-20 pl-4 py-3 h-12 rounded-full border border-gray-200 shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-16 focus:outline-none"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-2 h-8 w-8 text-blue-500"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
