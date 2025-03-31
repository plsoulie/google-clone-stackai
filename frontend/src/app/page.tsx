'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import { Clock, X } from "lucide-react";
import { fetchRecentSearches, RecentSearch } from "@/api/recent-searches";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [localSearchHistory, setLocalSearchHistory] = useState<string[]>([]);

  // Check if there's a query in the URL on initial load
  useEffect(() => {
    const queryParam = searchParams.get('q');
    
    if (queryParam) {
      setSearchQuery(queryParam);
      setHasSearched(true);
      router.push(`/search?q=${encodeURIComponent(queryParam)}`);
    }
  }, [searchParams, router]);

  // Fetch recent searches from the database
  useEffect(() => {
    const loadRecentSearches = async () => {
      setIsLoading(true);
      try {
        const searches = await fetchRecentSearches(6);
        
        if (searches && searches.length > 0) {
          setRecentSearches(searches);
          
          // Also populate local history with these searches for the case where 
          // we need to add a new search and update the UI immediately
          setLocalSearchHistory(searches.map(search => search.query));
        } else {
          // Set default searches if none returned
          const fallbackSearches = [
            "artificial intelligence",
            "machine learning",
            "neural networks",
            "deep learning",
            "stack ai github",
            "generative AI"
          ].map(query => ({
            query,
            timestamp: new Date().toISOString()
          }));
          
          setRecentSearches(fallbackSearches);
          setLocalSearchHistory(fallbackSearches.map(search => search.query));
        }
      } catch (error) {
        // Set default searches on error
        const fallbackSearches = [
          "artificial intelligence",
          "machine learning",
          "neural networks",
          "deep learning",
          "stack ai github",
          "generative AI"
        ].map(query => ({
          query,
          timestamp: new Date().toISOString()
        }));
        
        setRecentSearches(fallbackSearches);
        setLocalSearchHistory(fallbackSearches.map(search => search.query));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecentSearches();
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Add to local history if it doesn't exist yet
      if (!localSearchHistory.includes(query)) {
        setLocalSearchHistory(prev => [query, ...prev.slice(0, 9)]);
        
        // Also add to recent searches for immediate UI update
        // The database will be updated when the search is performed
        const newSearch: RecentSearch = {
          query,
          timestamp: new Date().toISOString()
        };
        setRecentSearches(prev => [newSearch, ...prev.filter(s => s.query.toLowerCase() !== query.toLowerCase()).slice(0, 5)]);
      }
      
      // Navigate to search page
      setSearchQuery(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const removeFromHistory = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    // Remove from local state only (we can't easily remove from database)
    setRecentSearches(prev => prev.filter(search => search.query !== query));
    setLocalSearchHistory(prev => prev.filter(item => item !== query));
  };
  
  // Format timestamp to a more readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

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
          {recentSearches.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Recent searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-gray-50 group"
                    onClick={() => handleHistoryClick(search.query)}
                  >
                    <Clock size={14} className="mr-2 text-gray-400" />
                    <span className="truncate max-w-[150px]">{search.query}</span>
                    <span className="ml-2 text-gray-400 text-xs hidden group-hover:inline">
                      {formatTimestamp(search.timestamp)}
                    </span>
                    <button 
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      onClick={(e) => removeFromHistory(e, search.query)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="mt-8">
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-gray-200 animate-pulse rounded-full px-10 py-1.5 text-transparent">
                    Loading...
                  </div>
                ))}
              </div>
            </div>
          )}
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