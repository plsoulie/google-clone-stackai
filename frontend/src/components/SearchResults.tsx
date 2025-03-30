import React, { useState, useEffect } from "react";
import axios from "axios";
import KnowledgePanel from "./KnowledgePanel";
import OrganicResult from "./OrganicResult";
import RelatedQuestions from "./RelatedQuestions";
import LocalMap from "./LocalMap";

interface SearchResultsProps {
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.post("http://localhost:8000/api/search", {
          query,
          num_results: 10
        });
        
        setResults(response.data);
        console.log("Search results:", response.data);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);

  // Helper function to extract knowledge panel data
  const getKnowledgePanelData = () => {
    if (!results?.knowledge_graph) return null;
    
    const kg = results.knowledge_graph;
    
    // Extract images if available
    const images = kg.header_images 
      ? kg.header_images.map((img: any) => img.image)
      : [];
    
    // Extract nutrition facts if available
    const facts = kg.list 
      ? {
          title: "Nutrition Facts",
          items: Object.entries(kg.list).map(([name, value]: [string, any]) => ({
            name,
            value: Array.isArray(value) ? value[0] : value
          }))
        }
      : undefined;
    
    // Extract sections if available
    const sections = [];
    
    // People also search for
    if (kg.people_also_search_for) {
      sections.push({
        title: "People also search for",
        items: kg.people_also_search_for.map((item: any) => ({
          name: item.name,
          image: item.image
        })),
        moreLink: "all"
      });
    }
    
    // Extract other possible sections
    if (kg.coffee_books) {
      sections.push({
        title: "Books about Coffee",
        items: kg.coffee_books.map((item: any) => ({
          name: item.name,
          image: item.image
        })),
        moreLink: "books"
      });
    }

    return {
      title: kg.title || "Knowledge Graph",
      subtitle: kg.type,
      description: kg.description || "No description available",
      source: kg.source?.name,
      images,
      facts,
      sections: sections.length > 0 ? sections : undefined
    };
  };

  // Helper function to format organic results
  const getOrganicResults = () => {
    if (!results?.organic_results) return [];
    
    return results.organic_results.map((result: any) => ({
      title: result.title,
      url: result.link,
      description: result.snippet || "No description available",
      breadcrumbs: result.displayed_link ? [result.displayed_link] : undefined,
    }));
  };

  // Helper function to get local results if available
  const getLocalResults = () => {
    if (!results?.local_results) return null;
    
    return {
      title: `${query} near you`,
      places: results.local_results.map((place: any, index: number) => ({
        id: `place-${index}`,
        name: place.title,
        rating: place.rating,
        reviews: place.reviews,
        type: place.type || "Business",
        address: place.address,
        features: place.features || [],
        image: place.thumbnail || "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png"
      }))
    };
  };

  // Helper function to format related questions
  const getRelatedQuestions = () => {
    if (!results?.related_questions) return [];
    
    return results.related_questions.map((question: any, index: number) => ({
      id: `question-${index}`,
      question: question.question,
      answer: question.snippet || "No answer available",
    }));
  };

  if (loading) {
    return <div className="py-10 text-center">Loading search results...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  if (!results) {
    return <div className="py-10 text-center">No results found</div>;
  }

  const knowledgePanelData = getKnowledgePanelData();
  const organicResults = getOrganicResults();
  const relatedQuestions = getRelatedQuestions();
  const localResults = getLocalResults();

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-2/3 pr-0 md:pr-6">
        {organicResults.length > 0 && organicResults.slice(0, 1).map((result: any, index: number) => (
          <OrganicResult key={`top-result-${index}`} {...result} />
        ))}

        {localResults && (
          <LocalMap title={localResults.title} places={localResults.places} />
        )}

        {organicResults.length > 1 && organicResults.slice(1).map((result: any, index: number) => (
          <OrganicResult key={`result-${index + 1}`} {...result} />
        ))}

        {relatedQuestions.length > 0 && (
          <RelatedQuestions 
            questions={relatedQuestions} 
            title="People also ask" 
          />
        )}

        <div className="mt-8 text-center">
          <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-6 rounded-md">
            See more results
          </button>
        </div>
      </div>

      <div className="md:w-1/3 mt-8 md:mt-0">
        {knowledgePanelData ? (
          <KnowledgePanel {...knowledgePanelData} />
        ) : (
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-gray-500">No knowledge panel data available for this query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 