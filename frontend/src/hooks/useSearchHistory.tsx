
import { useState, useEffect } from 'react';

const useSearchHistory = (initialHistory: string[] = []) => {
  const [searchHistory, setSearchHistory] = useState<string[]>(initialHistory);

  useEffect(() => {
    // Load search history from localStorage on mount
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prevHistory => {
      // Remove the query if it already exists (to avoid duplicates)
      const filteredHistory = prevHistory.filter(item => item !== query);
      
      // Add the new query to the beginning of the array
      const newHistory = [query, ...filteredHistory].slice(0, 10); // Limit to 10 items
      
      // Save to localStorage
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      return newHistory;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory
  };
};

export default useSearchHistory;
