import { NextRequest, NextResponse } from 'next/server';

// DeepSeek API parameters
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-d3ef9fa2019249adb0b5f5e95b285c72';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Create an AbortController for timeout control
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 8000) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { searchQuery } = await request.json();

    if (!searchQuery) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Use a simpler prompt to reduce token count and response time
    const messages = [
      {
        role: 'system',
        content: 'Provide a very brief, helpful answer to the search query.'
      },
      {
        role: 'user',
        content: `${searchQuery}`
      }
    ];
    
    try {
      // Call DeepSeek API with timeout
      const response = await fetchWithTimeout(
        DEEPSEEK_API_URL, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages,
            temperature: 0.5,  // Lower temperature for more deterministic responses
            max_tokens: 150    // Reduced max tokens for faster response
          })
        },
        8000 // 8-second timeout (to stay within Vercel's limits)
      );

      if (!response.ok) {
        // Try to parse the error and handle specific error codes
        let errorMessage = `API request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('DeepSeek API error:', errorData);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          // If we can't parse the JSON, just use the status text
          errorMessage = `${response.status}: ${response.statusText}`;
        }

        // For certain errors, we can provide a fallback response
        return NextResponse.json({
          ai_response: `I couldn't generate a response for "${searchQuery}" at this time. Please try again later.`,
          error: errorMessage
        });
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      return NextResponse.json({
        ai_response: aiResponse
      });
    } catch (error: any) {
      // Handle timeout specifically
      if (error.name === 'AbortError') {
        console.error('DeepSeek API request timed out');
        return NextResponse.json({
          ai_response: `I couldn't generate a response for "${searchQuery}" within the time limit. Please try a simpler query or try again later.`,
          error: 'Request timed out'
        });
      }
      
      // Handle other fetch errors
      console.error('Error calling DeepSeek API:', error);
      return NextResponse.json({
        ai_response: `I couldn't generate a response for "${searchQuery}" due to a technical issue. Please try again later.`,
        error: error.message || 'Unknown error'
      });
    }
  } catch (error: any) {
    console.error('Error in AI response API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate AI response',
      ai_response: 'Sorry, I encountered an error while trying to answer your question. Please try again later.'
    });
  }
} 