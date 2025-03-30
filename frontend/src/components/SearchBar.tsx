import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Search, Send, X } from "lucide-react";
import axios from 'axios';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  compact?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = "", onSearch, compact = false }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      try {
        setIsSearching(true);
        console.log('Initiating search for query:', query);
        
        // Update the URL to point to our backend server
        const response = await axios.post('http://localhost:8000/api/search', { 
          query, 
          num_results: 10 
        });
        
        console.log('Search results:', response.data);
        onSearch(query);
      } catch (error) {
        console.error('Error performing search:', error);
        alert('Error performing search. Check if the backend server is running.');
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
            placeholder="Search on StackAI..."
            className={`w-full bg-white border border-neutral-200 rounded-lg ${
              compact ? 'py-2 pl-10 pr-16' : 'py-3 pl-12 pr-20'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
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
              className={`rounded-full ${compact ? 'h-6 w-6' : 'h-8 w-8'} p-0 text-blue-500 hover:bg-blue-50`}
              disabled={!query.trim() || isSearching}
            >
              <Send size={compact ? 14 : 18} />
            </Button>
          </div>
        </div>
      </form>
      {isSearching && (
        <div className="text-center mt-4 text-sm text-gray-600">
          Searching... Check the terminal for results.
        </div>
      )}
    </div>
  );
};

export default SearchBar;
