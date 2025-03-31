'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIGeneratedResponseProps {
  response: string | null;
  isLoading: boolean;
}

// Function to convert text with asterisks to bold HTML
const formatResponseWithBold = (text: string): React.ReactNode => {
  if (!text) return null;
  
  // Split the text by double asterisks
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    // Check if this part is wrapped in double asterisks
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the asterisks and wrap in <strong> tag
      const boldText = part.substring(2, part.length - 2);
      return <strong key={index}>{boldText}</strong>;
    }
    // Return regular text as is
    return part;
  });
};

const AIGeneratedResponse: React.FC<AIGeneratedResponseProps> = ({ response, isLoading }) => {
  if (!response && !isLoading) return null;

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white mb-4">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="bg-purple-50 p-2 rounded-full mr-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium">AI-Generated Insight</h3>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
          </div>
        ) : (
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {response && formatResponseWithBold(response)}
          </div>
        )}
        
        <div className="mt-3 text-right text-xs text-gray-500">
          Powered by DeepSeek
        </div>
      </div>
    </div>
  );
};

export default AIGeneratedResponse; 