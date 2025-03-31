import { useState } from 'react';
import { performSearch } from '@/api/search';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface SearchResult {
  id: string;
  query: string;
  timestamp: Date;
  results: any;
  status: SearchStatus;
  error: string | null;
}

export function useSearch() {
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const [currentSearch, setCurrentSearch] = useState<SearchResult | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) return null;

    // Create search item
    const searchId = `search-${Date.now()}`;
    const searchItem: SearchResult = {
      id: searchId,
      query,
      timestamp: new Date(),
      results: null,
      status: 'loading',
      error: null
    };

    // Add to history and set as current search
    setSearchHistory(prev => [...prev, searchItem]);
    setCurrentSearch(searchItem);

    try {
      const results = await performSearch({ query });

      // Update with results
      const updatedItem = { 
        ...searchItem, 
        results, 
        status: 'success' as const
      };
      
      setSearchHistory(prev => 
        prev.map(item => item.id === searchId ? updatedItem : item)
      );
      setCurrentSearch(updatedItem);
      
      return updatedItem;
    } catch (error) {
      const errorMessage = "Failed to fetch search results. Please try again.";
      
      // Update error state
      const updatedItem = { 
        ...searchItem, 
        status: 'error' as const, 
        error: errorMessage 
      };
      
      setSearchHistory(prev => 
        prev.map(item => item.id === searchId ? updatedItem : item)
      );
      setCurrentSearch(updatedItem);
      
      return updatedItem;
    }
  };

  const removeSearch = (searchId: string) => {
    setSearchHistory(prev => prev.filter(item => item.id !== searchId));
    if (currentSearch?.id === searchId) {
      setCurrentSearch(null);
    }
  };

  return {
    searchHistory,
    currentSearch,
    search,
    removeSearch,
  };
} 