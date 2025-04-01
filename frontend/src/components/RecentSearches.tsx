'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, X } from 'lucide-react';
import { RecentSearch } from '@/lib/supabase';

interface RecentSearchesProps {
  onSelectSearch: (query: string) => void;
  limit?: number;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ 
  onSelectSearch,
  limit = 6
}) => {
  const [searches, setSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/recent-searches?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent searches');
        }
        
        const data = await response.json();
        setSearches(data.searches || []);
      } catch (err) {
        console.error('Error fetching recent searches:', err);
        setError('Unable to load recent searches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSearches();
  }, [limit]);

  const handleSearchClick = (query: string) => {
    if (onSelectSearch) {
      onSelectSearch(query);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 border rounded-md bg-white shadow-sm">
        <div className="flex items-center mb-2">
          <div className="bg-purple-50 p-2 rounded-full mr-2">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium">Recent Searches</h3>
        </div>
        <div className="animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-6 bg-gray-200 rounded my-2 w-3/4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-white shadow-sm">
        <div className="flex items-center mb-2">
          <div className="bg-purple-50 p-2 rounded-full mr-2">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium">Recent Searches</h3>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="p-4 border rounded-md bg-white shadow-sm">
        <div className="flex items-center mb-2">
          <div className="bg-purple-50 p-2 rounded-full mr-2">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium">Recent Searches</h3>
        </div>
        <p className="text-sm text-gray-500">No recent searches yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-purple-50 p-2 rounded-full mr-2">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium">Recent Searches</h3>
        </div>
      </div>
      
      <ul className="space-y-2">
        {searches.map((search) => (
          <li 
            key={search.id} 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer group"
            onClick={() => handleSearchClick(search.query)}
          >
            <div className="flex items-center">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-700">{search.query}</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(search.timestamp).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentSearches; 