import axios from 'axios';

export interface SearchParams {
  query: string;
  num_results?: number;
}

export async function performSearch(params: SearchParams) {
  try {
    // Use Next.js API route instead of directly calling backend
    // This allows for better error handling, caching, and middleware handling
    const response = await axios.post('/api/search', {
      query: params.query,
      num_results: params.num_results || 10
    });
    return response.data;
  } catch (error) {
    console.error('Error performing search:', error);
    throw error;
  }
} 