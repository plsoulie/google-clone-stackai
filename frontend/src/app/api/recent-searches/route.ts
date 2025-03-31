import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000/api/recent_searches';

export async function GET(request: NextRequest) {
  try {
    // Get the limit parameter from the URL
    const limit = request.nextUrl.searchParams.get('limit') || '6';
    
    // Make request to backend API with limit parameter
    const response = await axios.get(`${API_URL}?limit=${limit}`);
    
    // Return response data
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Recent searches API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch recent searches' },
      { status: 500 }
    );
  }
} 