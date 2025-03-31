'use client';

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Search, Send, X } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  compact?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = "", onSearch, compact = false }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Update query if initialQuery changes (for controlled usage)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      try {
        // We'll let the parent component handle the actual API call
        onSearch(query);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className={`w-full ${compact ? '' : 'max-w-3xl mx-auto mt-8'}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-neutral-400">
            <Search size={compact ? 16 : 20} />  
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={compact ? "Ask a follow-up question..." : "Search on StackAI..."}
            className={`w-full bg-white border border-neutral-200 rounded-md ${
              compact ? 'py-2 pl-10 pr-16' : 'py-3 pl-12 pr-20'
            } focus:outline-none focus:ring-2 focus:ring-black shadow-sm`}
          />
          <div className={`absolute right-3 flex items-center space-x-2`}>
            {query.trim() && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className={`rounded-full ${compact ? 'h-6 w-6' : 'h-8 w-8'} p-0 text-neutral-500 hover:bg-neutral-100`}
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={compact ? 14 : 18} />
              </Button>
            )}
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className={`rounded-full ${compact ? 'h-6 w-6' : 'h-8 w-8'} p-0 text-neutral-500 hover:bg-neutral-100`}
              aria-label="Voice search"
            >
              <Mic size={compact ? 14 : 18} />
            </Button>
            <Button 
              type="submit" 
              variant="ghost" 
              size="sm" 
              className={`rounded-full ${compact ? 'h-6 w-6' : 'h-8 w-8'} p-0 text-black hover:bg-gray-100`}
              disabled={!query.trim() || isSearching}
            >
              <Send size={compact ? 14 : 18} />
            </Button>
          </div>
        </div>
      </form>
      {isSearching && (
        <div className="text-center mt-4 text-sm text-gray-600">
          Searching... Please wait.
        </div>
      )}
    </div>
  );
};

export default SearchBar;
