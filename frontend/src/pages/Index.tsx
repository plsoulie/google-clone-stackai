import React, { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SearchBar from "@/components/SearchBar";
import SearchSidebar from "@/components/SearchSidebar";
import SearchInfo from "@/components/SearchInfo";
import OrganicResult from "@/components/OrganicResult";
import LocalMap from "@/components/LocalMap";
import RelatedQuestions from "@/components/RelatedQuestions";
import KnowledgePanel from "@/components/KnowledgePanel";
import { Button } from "@/components/ui/button";
import useSearchHistory from "@/hooks/useSearchHistory";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("Coffee");
  const [filter, setFilter] = useState("all");
  const [hasSearched, setHasSearched] = useState(true); // Set to true for initial display
  const { searchHistory, addToHistory } = useSearchHistory(['Coffee', 'Best restaurants in Austin', 'Weather forecast']);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
    addToHistory(query);
  };

  const mockCoffeeImages = ["/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png", "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png", "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png", "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png"];
  const organicResults = [{
    title: "Coffee - Wikipedia",
    url: "https://en.wikipedia.org/wiki/Coffee",
    description: "Coffee is a brewed drink prepared from roasted coffee beans, the seeds of berries from certain Coffea species. From the coffee fruit, the seeds are separated to produce a stable, raw product: unroasted green coffee.",
    breadcrumbs: ["https://en.wikipedia.org", "wiki", "Coffee"],
    tags: ["Coffee bean", "History", "Coffee production", "Coffee preparation"],
    metadata: {
      region: "Horn of Africa and South Arabia",
      color: "Black, dark brown, light brown, beige",
      introduced: "15th century"
    }
  }, {
    title: "21 Excellent Coffee Shops in Austin",
    url: "https://austin.eater.com/maps/best-coffee-austin-cafes",
    description: "3 days ago — 21 Excellent Coffee Shops in Austin · 1. Barner's Coffee · 2. Epoch Coffee · 3. Sa-Ten Coffee & Eats · 4. Houndstooth Coffee · 5. Civil Goat Coffee...",
    breadcrumbs: ["https://austin.eater.com", "maps", "best-coffee-austin-cafes"]
  }, {
    title: "Home | The Coffee Bean & Tea Leaf",
    url: "https://www.coffeebean.com/",
    description: "Icon of a bag of coffee being shipped to you. Subscriptions. Never run out of your favorite coffees, teas and powders again with our auto-delivery subscription.",
    breadcrumbs: ["https://www.coffeebean.com"],
    tags: ["Store Locator", "Coffee", "Cafe Menu", "Flavored Coffee"]
  }, {
    title: "coffee - Amazon.com",
    url: "https://www.amazon.com/coffee/s?k=coffee",
    description: "Results 1 - 48 of 29000+ — ... Peet Good Coffee Company · Whole Bean Coffee · Donut Shop",
    breadcrumbs: ["https://www.amazon.com", "coffee", "s?k=coffee"]
  }];
  const localPlaces = [{
    id: "1",
    name: "Houndstooth Coffee",
    rating: 4.5,
    reviews: 744,
    type: "Coffee shop",
    address: "401 Congress Ave #100c · In Frost Bank Tower",
    features: ["Dine-in", "Takeout", "No delivery"],
    image: "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png"
  }, {
    id: "2",
    name: "Starbucks",
    rating: 4.2,
    reviews: 909,
    type: "Coffee shop",
    address: "600 Congress Ave",
    features: ["Dine-in", "Takeout", "Delivery"],
    image: "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png"
  }, {
    id: "3",
    name: "The Hideout Coffee House",
    rating: 4.4,
    reviews: 274,
    type: "Coffee shop",
    address: "617 Congress Ave",
    features: ["Dine-in", "Takeout", "No-contact delivery"],
    image: "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png"
  }];
  const relatedQuestions = [{
    id: "q1",
    question: "Is it healthy to drink coffee everyday?",
    answer: "Moderate coffee consumption (1-3 cups per day) is generally considered safe and may even have health benefits like improved alertness, energy levels, and potentially lower risk of certain diseases."
  }, {
    id: "q2",
    question: "Is coffee made from poop?",
    answer: "Regular coffee is not made from poop. However, there is a specialty coffee called Kopi Luwak which involves coffee cherries that have been eaten and defecated by the Asian palm civet. This is a rare and expensive specialty product."
  }, {
    id: "q3",
    question: "What coffee does to your body?",
    answer: "Coffee contains caffeine which can increase alertness, boost metabolism, improve physical performance, and potentially protect against certain diseases. However, it can also cause jitteriness, anxiety, and sleep disruption in some people."
  }, {
    id: "q4",
    question: "Is coffee good for you or bad for you?",
    answer: "Coffee can be both good and bad depending on consumption levels and individual factors. Moderate consumption may offer benefits such as improved cognitive function and lower risk of certain diseases, while excessive consumption can lead to anxiety, insomnia, and digestive issues."
  }];
  const nutritionFacts = {
    title: "Nutrition Facts",
    items: [{
      name: "Amount Per 1 cup (8 fl oz) (237 g)",
      value: ""
    }, {
      name: "Calories",
      value: "1"
    }, {
      name: "Total Fat",
      value: "0 g",
      dailyValue: "0%"
    }, {
      name: "Saturated fat",
      value: "0 g",
      dailyValue: "0%"
    }, {
      name: "Trans fat regulation",
      value: "0 g"
    }, {
      name: "Cholesterol",
      value: "0 mg",
      dailyValue: "0%"
    }, {
      name: "Sodium",
      value: "5 mg",
      dailyValue: "0%"
    }, {
      name: "Potassium",
      value: "116 mg",
      dailyValue: "3%"
    }, {
      name: "Total Carbohydrate",
      value: "0 g",
      dailyValue: "0%"
    }, {
      name: "Dietary fiber",
      value: "0 g",
      dailyValue: "0%"
    }, {
      name: "Sugar",
      value: "0 g"
    }, {
      name: "Protein",
      value: "0.3 g",
      dailyValue: "0%"
    }, {
      name: "Caffeine",
      value: "95 mg"
    }]
  };
  const coffeeSections = [{
    title: "Species of coffee",
    moreLink: "5+ more",
    items: [{
      name: "Coffea arabica"
    }, {
      name: "Robusta"
    }, {
      name: "Coffea liberica"
    }, {
      name: "Helmarica yastaliva"
    }]
  }, {
    title: "Coffee books",
    moreLink: "4+ more",
    items: [{
      name: "The World Atlas of Coffee"
    }, {
      name: "Craft Coffee: A Manual"
    }, {
      name: "The Professional Barista's"
    }, {
      name: "The Curious Barista's"
    }]
  }];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full font-inter">
        <SearchSidebar 
          activeFilter={filter} 
          onFilterChange={setFilter} 
          searchHistory={searchHistory}
          onHistoryItemClick={handleSearch}
        />
        
        <SidebarInset className="flex-1 bg-white">
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="max-w-2xl text-center mb-12">
                <h1 className="text-5xl font-bold mb-6">AI Agents for the Enterprise</h1>
                <p className="text-xl text-gray-600 mb-8">
                  Augment your workforce with AI Agents. Outsource back office processes to LLMs. Make your organization smarter.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-stackai-accent hover:bg-stackai-accent/90 text-white px-6 py-2">Get a Demo</Button>
                  <Button variant="outline" className="text-stackai-accent border-stackai-accent hover:bg-stackai-accent/10">Start for free</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <main className="flex-grow p-6 overflow-auto">
                <SearchInfo totalResults="2,600,000,000" searchTime="0.64" query={searchQuery} />
                
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-2/3 pr-0 lg:pr-6">
                    {organicResults.slice(0, 1).map((result, index) => (
                      <OrganicResult key={index} {...result} />
                    ))}
                    
                    <LocalMap title="Coffee Shops" places={localPlaces} />
                    
                    {organicResults.slice(1).map((result, index) => (
                      <OrganicResult key={index + 1} {...result} />
                    ))}
                    
                    <RelatedQuestions title="People also ask" questions={relatedQuestions} />
                    
                    <div className="mt-8 text-center">
                      <button className="bg-gray-50 hover:bg-gray-100 text-stackai-accent font-semibold py-3 px-6 rounded-md">
                        See more results
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:w-1/3 mt-8 md:mt-0">
                    <KnowledgePanel 
                      title="Coffee" 
                      subtitle="Drink" 
                      description="Coffee is a brewed drink prepared from roasted coffee beans, the seeds of berries from certain Coffea species. From the coffee fruit, the seeds are separated to produce a stable, raw product: unroasted green coffee." 
                      source="Wikipedia" 
                      images={mockCoffeeImages} 
                      facts={nutritionFacts} 
                      sections={coffeeSections} 
                    />
                  </div>
                </div>
              </main>
              
              <footer className="border-t border-gray-200 py-6 bg-gradient-to-r from-gray-50 to-gray-100 w-full z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-3 text-sm font-medium text-stackai-accent">Ask anything or search the web</div>
                  <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
                </div>
              </footer>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
