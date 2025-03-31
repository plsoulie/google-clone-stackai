import React, { useState, useEffect } from "react";
import axios from "axios";
import KnowledgePanel from "./KnowledgePanel";
import OrganicResult from "./OrganicResult";
import RelatedQuestions from "./RelatedQuestions";
import LocalMap from "./LocalMap";
import SearchBar from "./SearchBar";

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
        console.log('SearchResults: Fetching results for query:', query);
        const response = await axios.post("http://localhost:8000/api/search", {
          query,
          num_results: 10
        });
        
        setResults(response.data);
        console.log("SearchResults: Raw response data:", response.data);
        console.log("SearchResults: Response data keys:", Object.keys(response.data));
        
        // Check for organic results
        if (Array.isArray(response.data.organic_results)) {
          console.log("SearchResults: Organic results length:", response.data.organic_results.length);
          console.log("SearchResults: First organic result:", response.data.organic_results[0]);
        } else {
          console.log("SearchResults: No valid organic_results array found");
        }
        
        // Detailed logging for local_results
        console.log("SearchResults: Local results structure:", response.data.local_results);
        if (Array.isArray(response.data.local_results)) {
          console.log("SearchResults: Local results is an array with length:", response.data.local_results.length);
          if (response.data.local_results.length > 0) {
            console.log("SearchResults: First local result:", response.data.local_results[0]);
            console.log("SearchResults: First local result keys:", Object.keys(response.data.local_results[0]));
            console.log("SearchResults: First local result thumbnail:", response.data.local_results[0].thumbnail);
          }
        } else if (response.data.local_results && typeof response.data.local_results === 'object') {
          console.log("SearchResults: Local results is an object with keys:", Object.keys(response.data.local_results));
          if (response.data.local_results.places && Array.isArray(response.data.local_results.places)) {
            console.log("SearchResults: Local results places array length:", response.data.local_results.places.length);
            if (response.data.local_results.places.length > 0) {
              console.log("SearchResults: First place:", response.data.local_results.places[0]);
              console.log("SearchResults: First place keys:", Object.keys(response.data.local_results.places[0]));
              console.log("SearchResults: First place thumbnail:", response.data.local_results.places[0].thumbnail);
            }
          }
        }
        
        // Compare the structure with mockSerpData.json
        console.log("SearchResults: Expected local_results structure from mockSerpData.json:", 
          "{ places: [ { position, title, place_id, reviews, price, type, address, thumbnail, ... } ] }");
      } catch (err) {
        console.error("SearchResults: Error fetching search results:", err);
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
    const attributes = kg.attributes || {};
    
    // Deep copy approach to avoid mutating the original data
    const processedAttributes = { ...attributes };
    
    // Log the knowledge graph data
    console.log("Knowledge Graph Data:", kg);
    console.log("Knowledge Graph Attributes:", attributes);
    
    // Process nested links in attributes
    Object.keys(processedAttributes).forEach(key => {
      // Check for _links fields and merge them with main data
      if (key.endsWith('_links') && Array.isArray(processedAttributes[key])) {
        const baseKey = key.replace('_links', '');
        // Only process if the base property exists
        if (processedAttributes[baseKey]) {
          console.log(`Processing links for ${baseKey}`);
        }
      }
    });
    
    return {
      title: kg.title || "Knowledge Graph",
      type: attributes.type || kg.type,
      description: kg.description || "No description available",
      header_images: attributes.header_images || kg.header_images,
      source: attributes.source || kg.source,
      patron_saint: attributes.patron_saint || kg.patron_saint,
      patron_saint_links: attributes.patron_saint_links || kg.patron_saint_links,
      chicory_coffee: attributes.chicory_coffee || kg.chicory_coffee,
      coffee_books: attributes.coffee_books || kg.coffee_books,
      people_also_search_for: attributes.people_also_search_for || kg.people_also_search_for,
      list: attributes.list || kg.list,
      see_results_about: attributes.see_results_about || kg.see_results_about,
      // Pass all attributes from the knowledge graph
      attributes: processedAttributes
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
      position: result.position,
      displayed_link: result.displayed_link,
      // Extract any additional metadata from the result
      metadata: Object.keys(result)
        .filter(key => !["title", "link", "snippet", "displayed_link", "position", "thumbnail"].includes(key))
        .reduce((obj: any, key) => {
          obj[key] = result[key];
          return obj;
        }, {}),
      // Generate tags from result properties like date or domain
      tags: [
        result.source,
        result.date
      ].filter(Boolean)
    }));
  };

  // Helper function to get local results if available
  const getLocalResults = () => {
    console.log("SearchResults: Processing local results:", results?.local_results);
    
    // Check if results.local_results exists
    if (!results?.local_results) {
      console.log("SearchResults: No local_results found in API response");
      return null;
    }
    
    // Since we're getting results directly from SerpAPI now, we may need to handle different formats
    let placesData;
    
    if (Array.isArray(results.local_results) && results.local_results.length > 0) {
      // Case 1: local_results is directly an array of places from our backend transformation
      placesData = results.local_results;
      console.log("SearchResults: Case 1: local_results is an array with data");
    } else if (results.local_results.places && Array.isArray(results.local_results.places) && results.local_results.places.length > 0) {
      // Case 2: local_results has a 'places' property that is an array (from mockSerpData.json format)
      placesData = results.local_results.places;
      console.log("SearchResults: Case 2: local_results has a places array with data");
    } else {
      console.log("SearchResults: No valid places data found in local_results");
      // Return null instead of using hardcoded fallback data
      return null;
    }
    
    console.log("Places data to map:", placesData);
    
    const mappedPlaces = placesData.map((place: any, index: number) => {
      console.log(`Processing place ${index}:`, place);
      console.log(`Place ${index} keys:`, Object.keys(place));
      console.log(`Place ${index} thumbnail:`, place.thumbnail);
      
      // Get image URL with multiple fallbacks
      let imageUrl = place.thumbnail || place.image || place.photo || place.icon;
      console.log(`Place ${index} imageUrl:`, imageUrl);
      
      // Force HTTPS if the URL starts with http://
      if (imageUrl && imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
        console.log(`Place ${index} imageUrl updated to https:`, imageUrl);
      }

      // Check if URL appears invalid due to unusual length or broken formatting
      if (imageUrl && (imageUrl.length > 400 || !imageUrl.match(/\.(jpeg|jpg|gif|png|svg|webp)($|\?)/i))) {
        console.log(`Place ${index} imageUrl might be invalid, using fallback based on title`);
        imageUrl = null; // Will trigger the fallback logic below
      }
      
      // Hardcoded known fallbacks if all else fails
      if (!imageUrl) {
        if (place.title === "Starbucks") {
          imageUrl = "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png";
        } else if (place.title === "Houndstooth Coffee") {
          imageUrl = "https://images.squarespace-cdn.com/content/v1/5b69adef7106992a45ce2bfb/1604615229582-YI4V6T80V33DHPZPPVHH/houndstoothlogo.png";
        } else if (place.title === "Lucky Lab Coffee") {
          imageUrl = "https://luckylabcoffee.com/wp-content/uploads/2020/03/luckydog.png";
        } else {
          imageUrl = "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png";
        }
      }
      
      // Ensure imageUrl is a string and not null/undefined
      imageUrl = imageUrl || "";
      
      const mappedPlace = {
        id: `place-${index}`,
        name: place.title,
        rating: place.rating || 0,
        reviews: place.reviews || 0,
        type: place.type || "Business",
        address: place.address || "",
        features: place.features || [],
        image: imageUrl // Ensure this is always set
      };
      
      console.log(`Mapped place ${index} image:`, mappedPlace.image);
      return mappedPlace;
    });
    
    console.log("Final mapped places:", mappedPlaces);
    
    return {
      title: `${query} near you`,
      places: mappedPlaces
    };
  };

  // Helper function to format related questions
  const getRelatedQuestions = () => {
    if (!results?.related_questions) return [];
    
    // Filter and map the questions to ensure we only get questions with good answers
    return results.related_questions
      .filter((question: any) => question.snippet && question.snippet.trim() && question.snippet !== "No answer available")
      .map((question: any, index: number) => ({
        id: `question-${index}`,
        question: question.question,
        answer: question.snippet || "",
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
    <div className="flex flex-col md:flex-row pb-40">
      
      <div className="md:w-2/3 pr-0 md:pr-6">

      {localResults && localResults.places && localResults.places.length > 0 && (
          <div className="">
            <LocalMap title={localResults.title} places={localResults.places} />
          </div>
        )}
       
        {/* Create a grid layout for organic results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {organicResults.map((result: any, index: number) => (
            <OrganicResult key={`result-${index}`} {...result} />
          ))}
        </div>

        {relatedQuestions.length > 0 && (
          <div className="mt-6">
          <RelatedQuestions 
            questions={relatedQuestions} 
            title="People also ask" 
          />
          </div>
        )}

        {/* <div className="mt-8 text-center">
          <button className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-md transition-colors border border-gray-200">
            See more results
          </button>
        </div> */}
      </div>

      <div className="md:w-1/3 mt-8 md:mt-0">
        {knowledgePanelData ? (
          <KnowledgePanel {...knowledgePanelData} />
        ) : (
          <div className="border border-gray-200 rounded-md p-4 bg-white">
            <p className="text-gray-500">No knowledge panel data available for this query.</p>
          </div>
        )}

      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 pt-0 pb-6 bg-gradient-to-r from-gray-100 to-gray-200 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-2">
          <SearchBar onSearch={(newQuery) => window.location.href = `/?q=${encodeURIComponent(newQuery)}`} initialQuery={query} />
          <div className="text-center mb-3 text-sm font-medium text-black mt-6">Powered by StackAI - Your Intelligent Agent</div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 