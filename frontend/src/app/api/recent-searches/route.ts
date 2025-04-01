import { NextRequest, NextResponse } from 'next/server';
import { getRecentSearches, storeSearchQuery } from '@/lib/supabase';

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
    await storeSearchQuery(query);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Store recent search API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to store search query' },
      { status: 500 }
    );
  }
} 