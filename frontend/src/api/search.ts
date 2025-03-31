import axios from 'axios';

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
    
    // Log the request for debugging
    console.log('Search request with location:', location);
    console.log('Full request payload:', requestBody);

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
    console.log('Search response received:', data);
    return data;
  } catch (error) {
    console.error('Error performing search:', error);
    throw error;
  }
};

export const pollForAIResponse = async (searchId: string, maxAttempts = 10, interval = 2000): Promise<string | null> => {
  try {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      console.log(`Polling for AI response (attempt ${attempts + 1}/${maxAttempts})...`);
      
      const response = await fetch(`/api/search/${searchId}/ai_response`);
      
      if (!response.ok) {
        throw new Error(`Failed to poll for AI response with status ${response.status}`);
      }
      
      const data: AIResponseResult = await response.json();
      
      if (data.status === 'complete' && data.ai_response) {
        console.log('AI response received:', data.ai_response);
        return data.ai_response;
      }
      
      // If still pending, wait and try again
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
    
    console.warn('Max polling attempts reached without receiving AI response');
    return null;
  } catch (error) {
    console.error('Error polling for AI response:', error);
    return null;
  }
}; 