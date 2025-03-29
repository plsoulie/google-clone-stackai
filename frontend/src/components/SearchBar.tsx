
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = "", onSearch }) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-4xl mx-auto">
      <div className="relative flex items-center w-full">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your message..."
          className="pr-20 pl-4 py-3 h-12 rounded-full border border-gray-200 shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500 w-full transition-all duration-300 font-inter"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-16 focus:outline-none"
            aria-label="Clear message"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-2 h-8 w-8 text-blue-600 hover:text-blue-800 transition-colors duration-300"
          disabled={!query.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
