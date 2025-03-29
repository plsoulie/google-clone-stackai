
import React, { useState } from "react";
import { Search } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import SearchInfo from "@/components/SearchInfo";
import OrganicResult from "@/components/OrganicResult";
import LocalMap from "@/components/LocalMap";
import RelatedQuestions from "@/components/RelatedQuestions";
import KnowledgePanel from "@/components/KnowledgePanel";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("Coffee");
  const [filter, setFilter] = useState("all");
  const [hasSearched, setHasSearched] = useState(true); // Set to true for initial display

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
  };

  const mockCoffeeImages = [
    "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png",
    "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png",
    "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png",
    "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png",
  ];

  // Sample data to populate the search results
  const organicResults = [
    {
      title: "Coffee - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Coffee",
      description:
        "Coffee is a brewed drink prepared from roasted coffee beans, the seeds of berries from certain Coffea species. From the coffee fruit, the seeds are ...",
      breadcrumbs: ["https://en.wikipedia.org", "wiki", "Coffee"],
      tags: ["Coffee bean", "History", "Coffee production", "Coffee preparation"],
      metadata: {
        region: "Horn of Africa and South Arabia",
        color: "Black, dark brown, light brown, beige",
        introduced: "15th century",
      },
    },
    {
      title: "21 Excellent Coffee Shops in Austin",
      url: "https://austin.eater.com/maps/best-coffee-austin-cafes",
      description:
        "3 days ago — 21 Excellent Coffee Shops in Austin · 1. Barner's Coffee · 2. Epoch Coffee · 3. Sa-Ten Coffee & Eats · 4. Houndstooth Coffee · 5. Civil Goat Coffee...",
      breadcrumbs: ["https://austin.eater.com", "maps", "best-coffee-austin-cafes"],
    },
    {
      title: "Home | The Coffee Bean & Tea Leaf",
      url: "https://www.coffeebean.com/",
      description:
        "Icon of a bag of coffee being shipped to you. Subscriptions. Never run out of your favorite coffees, teas and powders again with our auto-delivery subscription.",
      breadcrumbs: ["https://www.coffeebean.com"],
      tags: ["Store Locator", "Coffee", "Cafe Menu", "Flavored Coffee"],
    },
    {
      title: "coffee - Amazon.com",
      url: "https://www.amazon.com/coffee/s?k=coffee",
      description:
        "Results 1 - 48 of 29000+ — ... Peet Good Coffee Company · Whole Bean Coffee · Donut Shop",
      breadcrumbs: ["https://www.amazon.com", "coffee", "s?k=coffee"],
    },
  ];

  const localPlaces = [
    {
      id: "1",
      name: "Houndstooth Coffee",
      rating: 4.5,
      reviews: 744,
      type: "Coffee shop",
      address: "401 Congress Ave #100c · In Frost Bank Tower",
      features: ["Dine-in", "Takeout", "No delivery"],
      image: "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png",
    },
    {
      id: "2",
      name: "Starbucks",
      rating: 4.2,
      reviews: 909,
      type: "Coffee shop",
      address: "600 Congress Ave",
      features: ["Dine-in", "Takeout", "Delivery"],
      image: "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png",
    },
    {
      id: "3",
      name: "The Hideout Coffee House",
      rating: 4.4,
      reviews: 274,
      type: "Coffee shop",
      address: "617 Congress Ave",
      features: ["Dine-in", "Takeout", "No-contact delivery"],
      image: "/lovable-uploads/726b4c21-c05d-4367-9256-b19912ba327f.png",
    },
  ];

  const relatedQuestions = [
    {
      id: "q1",
      question: "Is it healthy to drink coffee everyday?",
      answer:
        "Moderate coffee consumption (1-3 cups per day) is generally considered safe and may even have health benefits like improved alertness, energy levels, and potentially lower risk of certain diseases.",
    },
    {
      id: "q2",
      question: "Is coffee made from poop?",
      answer:
        "Regular coffee is not made from poop. However, there is a specialty coffee called Kopi Luwak which involves coffee cherries that have been eaten and defecated by the Asian palm civet. This is a rare and expensive specialty product.",
    },
    {
      id: "q3",
      question: "What coffee does to your body?",
      answer:
        "Coffee contains caffeine which can increase alertness, boost metabolism, improve physical performance, and potentially protect against certain diseases. However, it can also cause jitteriness, anxiety, and sleep disruption in some people.",
    },
    {
      id: "q4",
      question: "Is coffee good for you or bad for you?",
      answer:
        "Coffee can be both good and bad depending on consumption levels and individual factors. Moderate consumption may offer benefits such as improved cognitive function and lower risk of certain diseases, while excessive consumption can lead to anxiety, insomnia, and digestive issues.",
    },
  ];

  const nutritionFacts = {
    title: "Nutrition Facts",
    items: [
      { name: "Amount Per 1 cup (8 fl oz) (237 g)", value: "" },
      { name: "Calories", value: "1" },
      { name: "Total Fat", value: "0 g", dailyValue: "0%" },
      { name: "Saturated fat", value: "0 g", dailyValue: "0%" },
      { name: "Trans fat regulation", value: "0 g" },
      { name: "Cholesterol", value: "0 mg", dailyValue: "0%" },
      { name: "Sodium", value: "5 mg", dailyValue: "0%" },
      { name: "Potassium", value: "116 mg", dailyValue: "3%" },
      { name: "Total Carbohydrate", value: "0 g", dailyValue: "0%" },
      { name: "Dietary fiber", value: "0 g", dailyValue: "0%" },
      { name: "Sugar", value: "0 g" },
      { name: "Protein", value: "0.3 g", dailyValue: "0%" },
      { name: "Caffeine", value: "95 mg" },
    ],
  };

  const coffeeSections = [
    {
      title: "Species of coffee",
      moreLink: "5+ more",
      items: [
        { name: "Coffea arabica" },
        { name: "Robusta" },
        { name: "Coffea liberica" },
        { name: "Helmarica yastaliva" },
      ],
    },
    {
      title: "Coffee books",
      moreLink: "4+ more",
      items: [
        { name: "The World Atlas of Coffee" },
        { name: "Craft Coffee: A Manual" },
        { name: "The Professional Barista's" },
        { name: "The Curious Barista's" },
      ],
    },
  ];

  // Conditional rendering for pre-search and post-search UI
  if (!hasSearched) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="mb-8">
          <svg className="w-24 h-8" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#4285F4"
              d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
            />
            <path
              fill="#EA4335"
              d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
            />
            <path
              fill="#FBBC05"
              d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
            />
            <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z" />
            <path
              fill="#EA4335"
              d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
            />
            <path
              fill="#4285F4"
              d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"
            />
          </svg>
        </div>
        <SearchBar onSearch={handleSearch} initialQuery="" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center">
          <div className="flex items-center mb-3 sm:mb-0">
            <a href="/" className="mr-8">
              <svg className="w-24 h-8" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#4285F4"
                  d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                />
                <path
                  fill="#EA4335"
                  d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                />
                <path
                  fill="#FBBC05"
                  d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
                />
                <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z" />
                <path
                  fill="#EA4335"
                  d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
                />
                <path
                  fill="#4285F4"
                  d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"
                />
              </svg>
            </a>
            <div className="flex-grow sm:max-w-xl">
              <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
            </div>
          </div>
          <div className="ml-auto hidden sm:flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Sign in
            </button>
          </div>
        </div>
        <div className="container mx-auto px-4">
          <SearchFilters activeFilter={filter} onFilterChange={setFilter} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 flex-grow">
        <SearchInfo
          totalResults="2,600,000,000"
          searchTime="0.64"
          query={searchQuery}
        />

        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3 pr-0 md:pr-6">
            {organicResults.slice(0, 1).map((result, index) => (
              <OrganicResult key={index} {...result} />
            ))}

            <LocalMap title="Coffee Shops" places={localPlaces} />

            {organicResults.slice(1).map((result, index) => (
              <OrganicResult key={index + 1} {...result} />
            ))}

            <RelatedQuestions
              title="People also ask"
              questions={relatedQuestions}
            />

            <div className="mt-8 text-center">
              <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-6 rounded-md">
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

      <footer className="border-t border-gray-200 py-4 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between text-sm text-gray-600">
            <div className="flex space-x-6 mb-3 md:mb-0">
              <span>United States</span>
            </div>
            <div className="flex flex-wrap space-x-6">
              <a href="#" className="hover:underline mb-2 md:mb-0">Help</a>
              <a href="#" className="hover:underline mb-2 md:mb-0">Privacy</a>
              <a href="#" className="hover:underline mb-2 md:mb-0">Terms</a>
              <a href="#" className="hover:underline">Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
