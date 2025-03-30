import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  const toggleQuestion = (id: string) => {
    if (expandedQuestions.includes(id)) {
      setExpandedQuestions(expandedQuestions.filter((qId) => qId !== id));
    } else {
      setExpandedQuestions([...expandedQuestions, id]);
    }
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-md overflow-hidden bg-white">
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
        {questions.map((q) => (
          <div key={q.id} className="border-b border-gray-100 last:border-b-0">
            <button
              className="w-full p-4 flex justify-between items-start text-left"
              onClick={() => toggleQuestion(q.id)}
            >
              <span className="text-base text-gray-800">{q.question}</span>
              {expandedQuestions.includes(q.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {expandedQuestions.includes(q.id) && (
              <div className="px-4 pb-4 pt-0 text-sm text-gray-700">
                {q.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 flex justify-end">
        <button className="text-xs text-gray-500">Feedback</button>
      </div>
    </div>
  );
};

export default RelatedQuestions;
