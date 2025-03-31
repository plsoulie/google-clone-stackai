'use client';

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// CSS for animation
const fadeInAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }

  .answer-container {
    overflow: hidden;
    transition: max-height 0.3s ease-out;
  }
`;

interface Question {
  id: string;
  question: string;
  answer: string;
}

interface RelatedQuestionsProps {
  questions: Question[];
  title: string;
}

const RelatedQuestions: React.FC<RelatedQuestionsProps> = ({ questions, title }) => {
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  // Filter out questions with no available answers
  const filteredQuestions = questions.filter(q => q.answer && q.answer !== "No answer available");

  const toggleQuestion = (id: string) => {
    if (expandedQuestions.includes(id)) {
      setExpandedQuestions(expandedQuestions.filter((qId) => qId !== id));
    } else {
      setExpandedQuestions([...expandedQuestions, id]);
    }
  };

  // If no questions with answers are available, don't render the component
  if (filteredQuestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 border border-gray-200 rounded-md overflow-hidden bg-white">
      {/* Inject the animation CSS */}
      <style dangerouslySetInnerHTML={{ __html: fadeInAnimation }} />
      
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <h3 className="text-lg font-medium">{title}</h3>
        <button className="text-gray-500">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 6.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="10" cy="13.5" r="0.5" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div>
        {filteredQuestions.map((q) => (
          <div key={q.id} className="border-b border-gray-100 last:border-b-0">
            <button
              className={`w-full p-4 flex justify-between items-start text-left transition-all duration-200 ease-in-out ${expandedQuestions.includes(q.id) ? 'bg-gray-50' : ''} hover:bg-gray-50 hover:pl-5 hover:shadow-inner group`}
              onClick={() => toggleQuestion(q.id)}
            >
              <span className="text-base text-gray-800 group-hover:text-black transition-colors duration-200">{q.question}</span>
              {expandedQuestions.includes(q.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-500 group-hover:text-gray-800 transition-colors duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-gray-800 transition-colors duration-200" />
              )}
            </button>
            {expandedQuestions.includes(q.id) && (
              <div className="px-4 pb-4 pt-0 text-sm text-gray-700 animate-fadeIn bg-gray-50">
                <p className="border-l-2 border-gray-400 pl-3">{q.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 flex justify-end">
        <button className="text-xs text-gray-500 px-2 py-1 rounded transition-all duration-200 hover:bg-gray-100 hover:text-black">Feedback</button>
      </div>
    </div>
  );
};

export default RelatedQuestions;
