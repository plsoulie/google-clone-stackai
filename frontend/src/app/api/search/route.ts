import { NextRequest, NextResponse } from 'next/server';

// SerpAPI parameters
const SERPAPI_KEY = process.env.SERPAPI_KEY || 'a5ea802c16d807959aa91eca47efc339a6cd42f33b68c8d3613e64646a9c7f65';
const SERPAPI_BASE_URL = 'https://serpapi.com/search';

export async function POST(request: NextRequest) {
  try {
    const { query, location } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build the SerpAPI URL with parameters
    const params = new URLSearchParams({
      q: query,
      api_key: SERPAPI_KEY,
      engine: 'google',
      google_domain: 'google.com',
      gl: 'us',                 // Country to use for the search
      hl: 'en',                 // Language
      num: '10',                // Number of results
    });

    // Add location if provided
    if (location) {
      params.append('location', location);
    }

    // Call SerpAPI
    const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Extract and transform the relevant data
    const transformedData = {
      search_id: query, // Using the query as the search ID for simplicity
      search_parameters: {
        q: query,
        location: location || null
      },
      organic_results: data.organic_results || [],
      knowledge_graph: data.knowledge_graph || null,
      related_questions: data.related_questions || [],
      related_searches: data.related_searches || [],
      local_results: data.local_results || null,
      inline_images: data.inline_images || [],
      answer_box: data.answer_box || null,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to perform search. Please try again.' },
      { status: 500 }
    );
  }
} 