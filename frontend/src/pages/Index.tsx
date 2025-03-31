import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "artificial intelligence",
    "machine learning",
    "neural networks",
    "natural language processing",
    "stack ai github"
  ]);

  // Check if there's a query in the URL on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    
    if (queryParam) {
      setSearchQuery(queryParam);
      setHasSearched(true);
    }
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim() && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
    }
    setSearchQuery(query);
    setHasSearched(true);
    
    // Update the URL without refreshing the page
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url);
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
    
    // Update the URL without refreshing the page
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url);
  };

  const removeFromHistory = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    setSearchHistory(prev => prev.filter(item => item !== query));
  };

  if (!hasSearched) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <div className="flex-grow flex flex-col items-center justify-center px-4">
          <div className="max-w-2xl text-center mb-8">
            <p className="text-xl text-gray-600 mb-8">
              Discover the power of AI-enhanced search. Get smarter results powered by StackAI's advanced machine learning algorithms.
            </p>
            <SearchBar onSearch={handleSearch} initialQuery="" />
            
            {/* Recent searches */}
            {searchHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Recent searches</h3>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((query, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-gray-50"
                      onClick={() => handleHistoryClick(query)}
                    >
                      <Clock size={14} className="mr-2 text-gray-400" />
                      <span className="truncate max-w-[150px]">{query}</span>
                      <button 
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        onClick={(e) => removeFromHistory(e, query)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4 justify-center mt-8">
              <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md">Advanced Search</Button>
              <Button variant="outline" className="bg-gray-100 text-gray-800 border-0 hover:bg-gray-200 px-6 py-2 rounded-md">Search Filters</Button>
            </div>
          </div>
        </div>

        <footer className="border-t border-gray-200 py-4 bg-gradient-to-r from-gray-100 to-gray-200 sticky bottom-0 w-full z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm font-medium text-gray-700">
              Powered by StackAI - Your Intelligent Agent
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isSearchPage={true} />

      <main className="container mx-auto px-4 py-4 flex-grow">
        <SearchResults query={searchQuery} />
      </main>
    </div>
  );
};

export default Index;
