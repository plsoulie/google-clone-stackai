import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import SearchInfo from "@/components/SearchInfo";
import SearchResults from "@/components/SearchResults";
import Header from "@/components/Header";
// import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Clock, Search, X } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "artificial intelligence",
    "machine learning",
    "neural networks",
    "natural language processing",
    "stack ai github"
  ]);

  const handleSearch = (query: string) => {
    if (query.trim() && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
    }
    setSearchQuery(query);
    setHasSearched(true);
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
  };

  const removeFromHistory = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    setSearchHistory(prev => prev.filter(item => item !== query));
  };

  if (!hasSearched) {
    return (
      // <Layout>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />

          <div className="flex-grow flex flex-col items-center justify-center px-4">
            <div className="max-w-2xl text-center mb-8">
              <p className="text-xl text-gray-600 mb-8">
                Discover the power of AI-enhanced search. Get smarter results powered by StackAI's advanced machine learning algorithms.
              </p>
              <SearchBar onSearch={handleSearch} initialQuery="" />
              <div className="flex gap-4 justify-center mt-8">
                <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md">Advanced Search</Button>
                <Button variant="outline" className="bg-gray-100 text-gray-800 border-0 hover:bg-gray-200 px-6 py-2 rounded-md">Search Filters</Button>
              </div>
            </div>
          </div>

          <footer className="border-t border-gray-200 py-6 bg-gradient-to-r from-gray-50 to-gray-100 sticky bottom-0 w-full z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="container mx-auto px-4">
              <div className="text-center mb-3 text-sm font-medium text-black">Powered by StackAI - Your Intelligent Agent</div>
            </div>
          </footer>
        </div>
      // </Layout>
    );
  }

  return (
    // <Layout>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header isSearchPage={true} />

        <main className="container mx-auto px-4 py-4 flex-grow">
          <SearchInfo totalResults="2,600,000,000" searchTime="0.64" query={searchQuery} />
          <SearchResults query={searchQuery} />
        </main>

        <footer className="border-t border-gray-200 py-6 bg-gradient-to-r from-gray-50 to-gray-100 sticky bottom-0 w-full z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-3 text-sm font-medium text-black">Search smarter with StackAI</div>
          </div>
        </footer>
      </div>
    // </Layout>
  );
};

// Dummy search results component
const DummySearchResults: React.FC<{ query: string }> = ({ query }) => {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-2/3 pr-0 md:pr-6">
        {/* Organic Results */}
        <div className="mb-6 max-w-2xl border border-gray-200 rounded-lg overflow-hidden p-4 bg-white">
          <div className="flex items-start">
            <div>
              <div className="flex text-sm text-gray-500 items-center mb-1">
                <span>en.wikipedia.org</span><span className="mx-1">›</span><span>wiki</span><span className="mx-1">›</span><span>Artificial_intelligence</span>
              </div>
              <h3 className="text-xl text-gray-800 font-medium hover:underline">
                <a href="https://en.wikipedia.org/wiki/Artificial_intelligence" target="_blank" rel="noopener noreferrer">
                  Artificial intelligence - Wikipedia
                </a>
              </h3>
              <div className="flex items-center text-green-700 text-sm">
                <span>en.wikipedia.org/wiki/Artificial_intelligence</span>
              </div>
              <p className="mt-1 text-sm text-gray-700">
                Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of humans or animals. AI applications include advanced web ...
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">History</span>
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Applications</span>
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Machine learning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Questions */}
        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h3 className="text-lg font-medium">People also ask</h3>
            <button className="text-gray-500 bg-gray-100 p-1 rounded-md hover:bg-gray-200 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="13.5" r="0.5" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <div>
            {[
              { id: "q1", question: "What exactly is artificial intelligence?", answer: "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents." },
              { id: "q2", question: "What are the 4 types of AI?", answer: "The four types of artificial intelligence are reactive machines, limited memory, theory of mind, and self-awareness." },
              { id: "q3", question: "What is AI in simple words?", answer: "AI or artificial intelligence is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction." }
            ].map((q) => (
              <div key={q.id} className="border-b border-gray-100 last:border-b-0">
                <button className="w-full p-4 flex justify-between items-start text-left hover:bg-gray-50 transition-colors">
                  <span className="text-base text-gray-800">{q.question}</span>
                  <svg className="h-5 w-5 text-gray-500 bg-gray-100 p-1 rounded-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors border border-gray-200">
            See more results
          </button>
        </div>
      </div>

      <div className="md:w-1/3 mt-8 md:mt-0">
        {/* Knowledge Panel */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="p-4">
            <div className="flex justify-between">
              <h2 className="text-2xl font-medium mb-1">Artificial intelligence</h2>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">Technology</p>

            <div className="grid grid-cols-2 gap-1 mb-4">
              <div className="bg-gray-100 h-20 md:h-32 rounded overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Artificial_intelligence_prompt_engineering.jpg/220px-Artificial_intelligence_prompt_engineering.jpg" alt="AI 1" className="w-full h-full object-cover" />
              </div>
              <div className="bg-gray-100 h-20 md:h-32 rounded overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Artificial_Intelligence_%26_AI_%26_Machine_Learning.jpg/220px-Artificial_Intelligence_%26_AI_%26_Machine_Learning.jpg" alt="AI 2" className="w-full h-full object-cover" />
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">
              Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by humans and animals. AI applications include advanced web search engines, recommendation systems, voice assistants, and self-driving cars.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              <span className="font-medium">Source:</span> Wikipedia
            </p>

            <div className="border-t border-gray-200 pt-3 mb-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Types of AI</h3>
                <a href="#" className="text-xs text-black flex items-center bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors">
                  View all <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["Narrow AI", "General AI", "Machine Learning", "Deep Learning"].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-gray-100 h-14 w-14 mx-auto rounded-lg overflow-hidden mb-1"></div>
                    <p className="text-xs">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Local Results */}
        <div className="mt-6">
          <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <h3 className="text-lg font-medium">AI near you</h3>
              <button className="text-gray-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <div className="h-44 bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Map View
              </div>
              
              <div className="absolute bottom-2 right-2 bg-white rounded px-2 py-1 text-xs text-gray-600">
                Map data ©2023 Google
              </div>
            </div>

            <div className="border-t border-gray-200">
              {[
                { id: "place1", name: "AI Research Center", rating: 4.8, reviews: 120, type: "Research", address: "123 Tech Blvd, Austin, TX", features: ["Open now", "Workshops"] },
                { id: "place2", name: "Machine Learning Institute", rating: 4.5, reviews: 86, type: "Education", address: "456 Innovation Dr, Austin, TX", features: ["Appointment only"] }
              ].map((place) => (
                <div key={place.id} className="p-3 border-b border-gray-100 flex">
                  <div className="flex-grow">
                    <h4 className="font-medium">{place.name}</h4>
                    <div className="flex items-center text-sm mb-1">
                      <div className="flex text-amber-500">
                        {"★".repeat(Math.floor(place.rating))}
                        {"☆".repeat(5 - Math.floor(place.rating))}
                      </div>
                      <span className="text-gray-500 ml-1">({place.reviews})</span>
                      <span className="mx-1">·</span>
                      <span className="text-gray-500">{place.type}</span>
                    </div>
                    <p className="text-sm text-gray-600">{place.address}</p>
                    <div className="text-sm text-gray-600 mt-1">
                      {place.features.join(" · ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 py-6 bg-gradient-to-r from-gray-50 to-gray-100 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-1 text-sm font-medium text-black">Search smarter with StackAI</div>
          <SearchBar onSearch={(newQuery) => window.location.href = `/?q=${encodeURIComponent(newQuery)}`} initialQuery={query} />
        </div>
      </div>
    </div>
  );
};

export default Index;
