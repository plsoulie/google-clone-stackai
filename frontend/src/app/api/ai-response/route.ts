import { NextRequest, NextResponse } from 'next/server';

// DeepSeek API parameters
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-d3ef9fa2019249adb0b5f5e95b285c72';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { searchQuery } = await request.json();

    if (!searchQuery) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Call DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides informative and concise answers to search queries.'
          },
          {
            role: 'user',
            content: `Provide a short, helpful answer to this search query: "${searchQuery}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({
      ai_response: aiResponse
    });
  } catch (error) {
    console.error('Error in AI response API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI response',
        ai_response: null
      },
      { status: 500 }
    );
  }
} 