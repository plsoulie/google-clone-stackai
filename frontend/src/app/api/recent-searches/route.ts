import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://emhyyzqavqijgumbnpzo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaHl5enFhdnFpamd1bWJucHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTM2OTUsImV4cCI6MjA1ODU4OTY5NX0.FwrMjA5E-LQWru3mwGfb1BtfcCu9m_25EgsZzSniv0Y';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get recent searches
async function getRecentSearches(limit: number = 6) {
  try {
    const { data, error } = await supabase
      .from('recent_searches')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch recent searches:', error);
    return [];
  }
}

// Helper function to store a search query
async function storeSearchQuery(query: string) {
  try {
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
    
    // Get recent searches from Supabase
    const searches = await getRecentSearches(limit);
    
    // Return response data
    return NextResponse.json({ searches });
  } catch (error) {
    console.error('Recent searches API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch recent searches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
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
      { error: 'Failed to store search query' },
      { status: 500 }
    );
  }
} 