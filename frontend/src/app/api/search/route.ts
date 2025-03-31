import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000/api/search';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Log request for debugging
    console.log('API route received request with location:', body.location);
    
    // Create the request payload with optional location
    const payload = {
      query: body.query,
      num_results: body.num_results || 10,
      ...(body.location ? { location: body.location } : {})
    };
    
    console.log('Sending payload to backend:', JSON.stringify(payload));
    
    // Make request to backend API
    const response = await axios.post(API_URL, payload);
    
    // Log response for debugging
    console.log('Received response from backend with status:', response.status);
    
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