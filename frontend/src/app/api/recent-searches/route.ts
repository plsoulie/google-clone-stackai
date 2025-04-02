import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://emhyyzqavqijgumbnpzo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaHl5enFhdnFpamd1bWJucHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTM2OTUsImV4cCI6MjA1ODU4OTY5NX0.FwrMjA5E-LQWru3mwGfb1BtfcCu9m_25EgsZzSniv0Y';

// Log the Supabase URL (without revealing the full key)
console.log(`Initializing Supabase client with URL: ${supabaseUrl}`);
console.log(`Supabase key available: ${!!supabaseKey}`);

// Create Supabase client with error handling
let supabase: SupabaseClient;
try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Better for serverless functions
      autoRefreshToken: false
    }
  });
  console.log('Supabase client initialized successfully');
} catch (err) {
  console.error('Failed to initialize Supabase client:', err);
  // Create a mock client that logs errors but doesn't fail
  supabase = {
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: new Error('Supabase client initialization failed') })
        })
      }),
      insert: () => Promise.resolve({ error: new Error('Supabase client initialization failed') })
    })
  } as unknown as SupabaseClient;
}

// Helper function to get recent searches
async function getRecentSearches(limit: number = 6) {
  try {
    console.log(`Fetching recent searches (limit: ${limit})...`);
    
    const { data, error } = await supabase
      .from('recent_searches')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }

    console.log(`Successfully retrieved ${data?.length || 0} recent searches`);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch recent searches:', error);
    return [];
  }
}

// Helper function to store a search query
async function storeSearchQuery(query: string) {
  try {
    console.log(`Storing search query: "${query}"`);
    
    const { error } = await supabase
      .from('recent_searches')
      .insert([
        { 
          query, 
          timestamp: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error storing search query:', error);
      return false;
    }
    
    console.log('Search query stored successfully');
    return true;
  } catch (error) {
    console.error('Failed to store search query:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the limit parameter from the URL
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 6;
    
    console.log(`Processing GET request for recent searches (limit: ${limit})`);
    
    // Get recent searches from Supabase
    const searches = await getRecentSearches(limit);
    
    // Return response data
    return NextResponse.json({ searches });
  } catch (error) {
    console.error('Recent searches API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch recent searches',
        searches: [] // Return empty array instead of failing
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received POST request with body:', body);
    
    const { query } = body;
    
    if (!query) {
      console.warn('Search query is missing in request');
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // Store search query in Supabase
    const success = await storeSearchQuery(query);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Store recent search API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to store search query',
        success: false
      },
      { status: 500 }
    );
  }
} 