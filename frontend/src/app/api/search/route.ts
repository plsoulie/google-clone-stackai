import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000/api/search';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Make request to backend API
    const response = await axios.post(API_URL, {
      query: body.query,
      num_results: body.num_results || 10
    });
    
    // Return response data
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Search API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 