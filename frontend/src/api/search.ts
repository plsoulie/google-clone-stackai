export interface SearchParams {
  query: string;
  num_results?: number;
  location?: string | null;
}

export interface AIResponseResult {
  search_id: string;
  ai_response: string | null;
  status: 'pending' | 'complete';
}

export const performSearch = async ({ 
  query, 
  location
}: { 
  query: string, 
  location?: string | null 
}) => {
  try {
    // Only include location if it's a non-empty string
    const requestBody: SearchParams = {
      query,
      num_results: 10,
      ...(location ? { location } : {})
    };

    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Search request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error performing search:', error);
    throw error;
  }
};

export const pollForAIResponse = async (searchId: string, maxAttempts = 10, interval = 2000): Promise<string | null> => {
  try {
    // With serverless approach, we'll just make a single call to get the AI response
    const response = await fetch(`/api/ai-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchQuery: searchId }),
    });
      
    if (!response.ok) {
      throw new Error(`Failed to get AI response with status ${response.status}`);
    }
      
    const data = await response.json();
    return data.ai_response;
  } catch (error) {
    console.error('Error getting AI response:', error);
    return null;
  }
}; 