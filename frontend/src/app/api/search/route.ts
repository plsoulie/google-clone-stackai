import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// SerpAPI parameters
const SERPAPI_KEY = process.env.SERPAPI_KEY || 'a5ea802c16d807959aa91eca47efc339a6cd42f33b68c8d3613e64646a9c7f65';
const SERPAPI_BASE_URL = 'https://serpapi.com/search';

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://emhyyzqavqijgumbnpzo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaHl5enFhdnFpamd1bWJucHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTM2OTUsImV4cCI6MjA1ODU4OTY5NX0.FwrMjA5E-LQWru3mwGfb1BtfcCu9m_25EgsZzSniv0Y';

// Log the Supabase credentials for debugging (masking the key)
console.log(`Search API: Supabase URL = ${supabaseUrl}, Key available: ${!!supabaseKey}`);

// Create Supabase client with error handling
let supabase: SupabaseClient;
try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Better for serverless functions
      autoRefreshToken: false
    }
  });
  console.log('Search API: Supabase client initialized successfully');
} catch (err) {
  console.error('Search API: Failed to initialize Supabase client:', err);
  // Create a mock client that returns empty results but doesn't throw
  supabase = {
    from: () => ({
      insert: () => Promise.resolve({ error: new Error('Supabase client initialization failed') })
    })
  } as unknown as SupabaseClient;
}

// Helper function to store a search query
async function storeSearchQuery(query: string): Promise<void> {
  try {
    console.log(`Search API: Storing search query "${query}" in Supabase`);
    
    if (!supabase || typeof supabase.from !== 'function') {
      console.warn('Search API: Supabase client not properly initialized');
      return;
    }
    
    const { error } = await supabase
      .from('recent_searches')
      .insert([
        { 
          query, 
          timestamp: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Search API: Error storing search query:', error);
    } else {
      console.log('Search API: Successfully stored search query');
    }
  } catch (error) {
    console.error('Search API: Failed to store search query:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Search API: Received POST request');
    const body = await request.json();
    const { query, location } = body;
    
    console.log(`Search API: Processing search for query="${query}", location=${location || 'null'}`);

    if (!query) {
      console.warn('Search API: Missing query parameter');
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // Store search query in Supabase (non-blocking)
    storeSearchQuery(query).catch(err => 
      console.error('Search API: Failed to store search query:', err)
    );

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

    console.log(`Search API: Calling SerpAPI with query="${query}"`);
    
    // Call SerpAPI
    const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = `SerpAPI request failed with status ${response.status}`;
      console.error(`Search API: ${errorText}`);
      throw new Error(errorText);
    }

    const data = await response.json();
    console.log(`Search API: Received response from SerpAPI (${Object.keys(data).length} keys)`);

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
    console.error('Search API: Error processing search request:', error);
    return NextResponse.json(
      { error: 'Failed to perform search. Please try again.' },
      { status: 500 }
    );
  }
} 