'use client';

import React, { useState, useEffect, useRef } from "react";
import KnowledgePanel from "./KnowledgePanel";
import OrganicResult from "./OrganicResult";
import RelatedQuestions from "./RelatedQuestions";
import LocalMap from "./LocalMap";
import SearchBar from "./SearchBar";
import { Search, ChevronDown, X, MessageSquare } from "lucide-react";
import { performSearch, pollForAIResponse } from "@/api/search";
import AIGeneratedResponse from './AIGeneratedResponse';

interface SearchResultsProps {
  query: string;
}

interface SearchItem {
  id: string;
  query: string;
  timestamp: Date;
  results: any;
  loading: boolean;
  error: string | null;
  isExpanded: boolean;
  location?: string | null;
  aiResponseLoading?: boolean;
  aiResponsePolling?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query: initialQuery }) => {
  const [searchHistory, setSearchHistory] = useState<SearchItem[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const latestSearchHeaderRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  
  // Get user's location on component mount
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Check if geolocation is supported
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              maximumAge: 60000,
              enableHighAccuracy: false
            });
          });
          
          // Use reverse geocoding to get location name from coordinates
          const { latitude, longitude } = position.coords;
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          
          if (!apiKey) {
            console.error("Google Maps API key not found");
            return;
          }
          
          // Use result_type parameter to get more specific location components
          // We're removing the result_type filter to get all components
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          
          if (response.ok) {
            const data = await response.json();
            console.log("Geocoding API response:", data);
            
            if (data.results && data.results.length > 0) {
              // First try to construct a properly formatted location string
              let city = "";
              let state = "";
              let country = "";
              
              // Loop through address components to find city, state, and country
              const components = data.results[0].address_components;
              if (components && Array.isArray(components)) {
                for (const component of components) {
                  if (component.types.includes("locality")) {
                    city = component.long_name;
                  } else if (component.types.includes("administrative_area_level_1")) {
                    state = component.long_name; // Use long_name for full state name (e.g., "California" not "CA")
                  } else if (component.types.includes("country")) {
                    country = component.long_name; // Use long_name for full country name
                  }
                }
              }
              
              // Create a properly formatted location string
              let formattedLocation = "";
              if (city && state && country) {
                formattedLocation = `${city}, ${state}, ${country}`;
              } else {
                // Fallback to formatted_address if we couldn't extract all components
                formattedLocation = data.results[0].formatted_address;
              }
              
              console.log("User location detected:", formattedLocation);
              
              // SerpAPI expects location in format "City, State, Country"
              setUserLocation(formattedLocation);
              
              // Log for debugging
              console.log("Setting search location parameter to:", formattedLocation);
            }
          }
        }
      } catch (error) {
        console.error("Error getting user location:", error);
        // Don't set a default location if there's an error
      }
    };
    
    getUserLocation();
  }, []);
  
  // Effect to scroll to the latest search header whenever a new search is added
  useEffect(() => {
    if (latestSearchHeaderRef.current) {
      latestSearchHeaderRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchHistory.length]);

  // Initialize with the first search query
  useEffect(() => {
    if (initialQuery && !searchHistory.some(item => item.query === initialQuery)) {
      const initialSearchItem: SearchItem = {
        id: `search-${Date.now()}`,
        query: initialQuery,
        timestamp: new Date(),
        results: null,
        loading: true,
        error: null,
        isExpanded: true,
        location: userLocation
      };
      
      setSearchHistory([initialSearchItem]);
      fetchResults(initialSearchItem.id, initialQuery, userLocation);
    }
  }, [initialQuery, userLocation]);

  const fetchResults = async (searchId: string, searchQuery: string, location: string | null) => {
    if (!searchQuery.trim()) return;
    
    // Update loading state
    setSearchHistory(prev => prev.map(item => 
      item.id === searchId 
        ? { ...item, loading: true, error: null } 
        : item
    ));
    
    try {
      // Only pass location if it's available
      const searchParams = {
        query: searchQuery,
        ...(location ? { location } : {})
      };
      
      const results = await performSearch(searchParams);
      
      // Update with results
      setSearchHistory(prev => prev.map(item => 
        item.id === searchId 
          ? { 
              ...item, 
              loading: false, 
              results,
              error: null,
              aiResponseLoading: true,
              aiResponsePolling: false
            } 
          : item
      ));

      // Start polling for AI response if search_id is available
      if (results.search_id) {
        startPollingAIResponse(searchId, results.search_id);
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
      
      // Update error state
      setSearchHistory(prev => prev.map(item => 
        item.id === searchId 
          ? { 
              ...item, 
              loading: false, 
              error: "Failed to fetch search results. Please try again."
            } 
          : item
      ));
    }
  };

  // Function to start polling for AI response
  const startPollingAIResponse = async (clientSearchId: string, serverSearchId: string) => {
    // Mark as polling
    setSearchHistory(prev => prev.map(item => 
      item.id === clientSearchId 
        ? { ...item, aiResponsePolling: true } 
        : item
    ));
    
    try {
      const aiResponse = await pollForAIResponse(serverSearchId);
      
      // Update search history with AI response
      setSearchHistory(prev => prev.map(item => 
        item.id === clientSearchId 
          ? { 
              ...item, 
              aiResponseLoading: false, 
              aiResponsePolling: false,
              results: {
                ...item.results,
                ai_response: aiResponse
              }
            } 
          : item
      ));
    } catch (error) {
      console.error("Error polling for AI response:", error);
      
      // Update polling state but keep loading true
      setSearchHistory(prev => prev.map(item => 
        item.id === clientSearchId 
          ? { ...item, aiResponsePolling: false, aiResponseLoading: false } 
          : item
      ));
    }
  };

  const handleNewSearch = (newQuery: string) => {
    // Add the new search to history
    const newSearchItem: SearchItem = {
      id: `search-${Date.now()}`,
      query: newQuery,
      timestamp: new Date(),
      results: null,
      loading: true, 
      error: null,
      isExpanded: true,
      location: userLocation
    };
    
    setSearchHistory(prev => [...prev, newSearchItem]);
    fetchResults(newSearchItem.id, newQuery, userLocation);
    setCurrentQuery("");
  };

  const toggleExpand = (searchId: string) => {
    setSearchHistory(prev => prev.map(item =>
      item.id === searchId
        ? { ...item, isExpanded: !item.isExpanded }
        : item
    ));
  };

  const removeSearch = (searchId: string) => {
    setSearchHistory(prev => prev.filter(item => item.id !== searchId));
  };

  // Helper function to extract knowledge panel data
  const getKnowledgePanelData = (results: any) => {
    if (!results?.knowledge_graph) return null;
    
    const kg = results.knowledge_graph;
    const attributes = kg.attributes || {};
    
    // Deep copy approach to avoid mutating the original data
    const processedAttributes = { ...attributes };
    
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
  const getOrganicResults = (results: any) => {
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
  const getLocalResults = (results: any) => {
    // Check if results.local_results exists
    if (!results?.local_results) {
      return null;
    }
    
    // Since we're getting results directly from SerpAPI now, we may need to handle different formats
    let placesData;
    
    if (Array.isArray(results.local_results) && results.local_results.length > 0) {
      // Case 1: local_results is directly an array of places from our backend transformation
      placesData = results.local_results;
    } else if (results.local_results.places && Array.isArray(results.local_results.places) && results.local_results.places.length > 0) {
      // Case 2: local_results has a 'places' property that is an array (from mockSerpData.json format)
      placesData = results.local_results.places;
    } else {
      // Return null instead of using hardcoded fallback data
      return null;
    }
    
    const mappedPlaces = placesData.map((place: any, index: number) => {
      // Get thumbnail and image URLs directly from SerpAPI
      let thumbnail = place.thumbnail;
      
      // Get image URL with multiple fallbacks
      let imageUrl = place.image || place.photo || place.icon;
      
      // Force HTTPS if the URL starts with http://
      if (imageUrl && imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
      }

      if (thumbnail && thumbnail.startsWith('http://')) {
        thumbnail = thumbnail.replace('http://', 'https://');
      }
      
      // Extract city from address
      let city = "";
      if (place.address) {
        // Split address by commas and get the city part
        const addressParts = place.address.split(',').map(part => part.trim());
        if (addressParts.length >= 2) {
          // City is typically the second-to-last part
          city = addressParts[addressParts.length - 2];
        }
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
          imageUrl = "/placeholder-business.png";
        }
      }
      
      return {
        id: `place-${index}`,
        name: place.title,
        rating: place.rating || 0,
        reviews: place.reviews || 0,
        type: place.type || "Business",
        address: place.address || "",
        features: place.features || [],
        image: imageUrl,
        thumbnail: thumbnail,
        city: city
      };
    });
    
    return {
      title: `${results.search_parameters?.q || "Places"} near you`,
      places: mappedPlaces
    };
  };

  // Helper function to format related questions
  const getRelatedQuestions = (results: any) => {
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

  // Render a single search result item
  const renderSearchItem = (searchItem: SearchItem, index: number) => {
    const { id, query, loading, error, results, isExpanded, aiResponseLoading } = searchItem;
    const isLatestSearch = index === searchHistory.length - 1;
    
    if (loading) {
      return (
        <div key={id} className="mb-8 pb-8 border-b border-gray-200">
          <div 
            className="flex items-center mb-4 border border-gray-200 shadow-md rounded-lg py-2 px-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
            ref={isLatestSearch ? latestSearchHeaderRef : null}
          >
            <div className="bg-teal-50 p-2 rounded-full mr-2">
              <Search size={18} className="text-teal-600" />
            </div>
            <h2 className="text-lg font-medium truncate flex-1 mr-2">{query}</h2>
            <div className="flex items-center">
              <button 
                className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent toggle when removing
                  removeSearch(id);
                }}
                aria-label="Remove search"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="py-4 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-teal-600 motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div key={id} className="mb-8 pb-8 border-b border-gray-200">
          <div 
            className="flex items-center mb-4 border border-gray-200 shadow-md rounded-lg py-2 px-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
            ref={isLatestSearch ? latestSearchHeaderRef : null}
            onClick={() => toggleExpand(id)}
          >
            <div className="bg-teal-50 p-2 rounded-full mr-2">
              <Search size={18} className="text-teal-600" />
            </div>
            <h2 className="text-lg font-medium truncate flex-1 mr-2">{query}</h2>
            <div className="flex items-center">
              <button
                className="ml-2 hover:bg-gray-100 p-1 rounded-full w-6 h-6 flex items-center justify-center"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
              </button>
              <button 
                className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent toggle when removing
                  removeSearch(id);
                }}
                aria-label="Remove search"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="py-6 text-center text-red-500">
            {error}
          </div>
        </div>
      );
    }

    if (!results) {
      return null;
    }

    const knowledgePanelData = getKnowledgePanelData(results);
    const organicResults = getOrganicResults(results);
    const relatedQuestions = getRelatedQuestions(results);
    const localResults = getLocalResults(results);

    return (
      <div key={id} className="mb-8 pb-8 border-b border-gray-200">
        <div 
          className="flex items-center mb-4 sticky top-20 bg-white z-10 py-2 px-4 rounded-lg border border-gray-200 shadow-md cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-lg"
          ref={isLatestSearch ? latestSearchHeaderRef : null}
          onClick={() => toggleExpand(id)}
        >
          <div className="bg-teal-50 p-2 rounded-full mr-2">
            <Search size={18} className="text-teal-600" />
          </div>
          <h2 className="text-lg font-medium truncate flex-1 mr-2">{query}</h2>
          <div className="flex items-center">
            <button
              className="ml-2 hover:bg-gray-100 p-1 rounded-full w-6 h-6 flex items-center justify-center"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
            </button>
            <button 
              className="ml-2 p-1 hover:bg-gray-100 rounded-full"
              onClick={(e) => {
                e.stopPropagation(); // Prevent toggle when removing
                removeSearch(id);
              }}
              aria-label="Remove search"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 pr-0 md:pr-6">
              {userLocation && localResults && localResults.places && localResults.places.length > 0 && (
                <div className="mb-6">
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
                <div className="mb-6">
                  <RelatedQuestions 
                    questions={relatedQuestions} 
                    title="People also ask" 
                  />
                </div>
              )}
            </div>

            <div className="md:w-1/3 mt-8 md:mt-0">
              <AIGeneratedResponse 
                response={results.ai_response}
                isLoading={aiResponseLoading || false}
              />
              
              {knowledgePanelData && (
                <KnowledgePanel {...knowledgePanelData} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-40">
      {/* History of search results */}
      <div className="space-y-4">
        {searchHistory.map((searchItem, index) => renderSearchItem(searchItem, index))}
      </div>

      {/* Input area for new search */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 py-4 bg-gradient-to-r from-gray-100 to-gray-200 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              <MessageSquare size={16} className="text-gray-600" />
            </div>
            <div className="flex-grow">
              <SearchBar 
                initialQuery={currentQuery} 
                onSearch={handleNewSearch} 
                compact={true}
              />
            </div>
          </div>
          <div className="text-center mt-4 text-xs text-gray-500">
            Powered by StackAI - Your Intelligent Agent
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 