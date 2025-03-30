import React from "react";
import { ChevronRight, Share2 } from "lucide-react";

interface NutritionFact {
  name: string;
  value: string;
  dailyValue?: string;
  subItems?: {
    name: string;
    value: string;
    dailyValue?: string;
  }[];
}

interface KnowledgePanelProps {
  title: string;
  type?: string;
  description: string;
  header_images?: {
    image: string;
    source: string;
  }[];
  source?: {
    name: string;
    link: string;
  };
  patron_saint?: string;
  patron_saint_links?: {
    patron_saint_text: string;
    patron_saint_link: string;
  }[];
  chicory_coffee?: {
    name: string;
    link: string;
    image: string;
  }[];
  coffee_books?: {
    name: string;
    link: string;
    image: string;
  }[];
  people_also_search_for?: {
    name: string;
    link: string;
    image: string;
  }[];
  list?: {
    [key: string]: string[];
  };
  see_results_about?: {
    name: string;
    extensions?: string[];
    image: string;
  }[];
}

const KnowledgePanel: React.FC<KnowledgePanelProps> = ({
  title,
  type,
  description,
  header_images,
  source,
  patron_saint,
  patron_saint_links,
  chicory_coffee,
  coffee_books,
  people_also_search_for,
  list,
  see_results_about,
}) => {
  const renderNutritionSection = () => {
    if (!list) return null;
    
    const nutritionItems = Object.entries(list).map(([key, values]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        name: formattedKey,
        value: values[0],
        dailyValue: values[1]
      };
    });
    
    return (
      <div className="border-t border-gray-200 pt-3 mb-4">
        <h3 className="font-medium mb-2">Nutrition Facts</h3>
        <div className="text-sm">
          {nutritionItems.map((fact, i) => (
            <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-700">{fact.name}</span>
              <div className="flex items-center">
                <span className="font-medium">{fact.value}</span>
                {fact.dailyValue && (
                  <span className="ml-4 text-gray-500 w-16 text-right">{fact.dailyValue}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderImageSection = (items: {name: string; image: string}[], title: string, moreLink?: string) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="border-t border-gray-200 pt-3 mb-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">{title}</h3>
          {moreLink && (
            <a href={moreLink} className="text-xs text-blue-600 flex items-center">
              View all <ChevronRight className="h-3 w-3 ml-1" />
            </a>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {items.slice(0, 4).map((item, j) => (
            <div key={j} className="text-center">
              <div className="bg-gray-100 h-14 w-14 mx-auto rounded-md overflow-hidden mb-1">
                {item.image && (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                )}
              </div>
              <p className="text-xs line-clamp-2">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
      <div className="p-4">
        <div className="flex justify-between">
          <div>
            <h2 className="text-2xl font-medium mb-1">{title}</h2>
            {type && <p className="text-gray-500 mb-2">{type}</p>}
          </div>
          <Share2 className="h-5 w-5 text-gray-500" />
        </div>

        {header_images && header_images.length > 0 && (
          <div className="grid grid-cols-2 gap-1 mb-4">
            {header_images.slice(0, 4).map((img, i) => (
              <div key={i} className="bg-gray-100 h-20 md:h-32 rounded overflow-hidden">
                <img src={img.image} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {header_images.length > 4 && (
              <div className="absolute bottom-2 right-2 bg-white text-xs px-2 py-1 rounded-sm shadow">
                More images
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-700 mb-3">{description}</p>
        
        {source && (
          <p className="text-xs text-gray-500 mb-4">
            <span className="font-medium">Source:</span> {source.name}
          </p>
        )}

        {patron_saint && (
          <div className="border-t border-gray-200 pt-3 mb-4">
            <p className="text-sm mb-2">
              <span className="font-medium">Patron Saint:</span> {patron_saint}
            </p>
            {patron_saint_links && patron_saint_links.map((link, i) => (
              <a key={i} href={link.patron_saint_link} className="text-xs text-blue-600 block">
                {link.patron_saint_text}
              </a>
            ))}
          </div>
        )}

        {renderNutritionSection()}

        {see_results_about && see_results_about.length > 0 && (
          <div className="border-t border-gray-200 pt-3 mb-4">
            <h3 className="font-medium mb-2">See results about</h3>
            <div className="flex items-center">
              {see_results_about[0].image && (
                <div className="h-16 w-16 rounded-md overflow-hidden mr-3">
                  <img src={see_results_about[0].image} alt={see_results_about[0].name} className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <p className="font-medium">{see_results_about[0].name}</p>
                {see_results_about[0].extensions && (
                  <p className="text-sm text-gray-600">{see_results_about[0].extensions.join(", ")}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {renderImageSection(chicory_coffee, "Chicory Coffee")}
        {renderImageSection(coffee_books, "Coffee Books")}
        {renderImageSection(people_also_search_for, "People also search for")}
      </div>
    </div>
  );
};

export default KnowledgePanel;

