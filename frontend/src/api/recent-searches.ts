export interface RecentSearch {
  query: string;
  timestamp: string;
}

export interface RecentSearchesResponse {
  recent_searches: RecentSearch[];
}

export const fetchRecentSearches = async (limit: number = 6): Promise<RecentSearch[]> => {
  try {
    const response = await fetch(`/api/recent-searches?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recent searches: ${response.status}`);
    }
    
    const data: RecentSearchesResponse = await response.json();
    return data.recent_searches || [];
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return [];
  }
}; 