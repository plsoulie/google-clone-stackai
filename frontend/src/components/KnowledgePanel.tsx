'use client';

import React from "react";
import { ChevronRight, Share2, ExternalLink, MapPin, Calendar, Info, User, Building, MountainSnow, BookOpen } from "lucide-react";

interface Link {
  text: string;
  link: string;
}

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
  attributes?: {
    [key: string]: any;
  };
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
  attributes,
}) => {
  // Check if there's meaningful data to display
  const hasContent = () => {
    // Essential content checks
    if (!title || title === "Knowledge Graph") return false;
    if (!description || description === "No description available.") {
      // If description is missing, we need to have some other significant content
      return !!(
        (header_images && header_images.length > 0) ||
        (people_also_search_for && people_also_search_for.length > 0) ||
        (coffee_books && coffee_books.length > 0) ||
        (chicory_coffee && chicory_coffee.length > 0) ||
        patron_saint ||
        (see_results_about && see_results_about.length > 0) ||
        (attributes && Object.keys(attributes).length > 2) // More than just basic attributes
      );
    }
    return true;
  };
  
  // If there's no meaningful content, don't render the panel
  if (!hasContent()) {
    return null;
  }

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

  const renderImageSection = (items: {name: string; image: string; link?: string}[], title: string, moreLink?: string) => {
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
            <a 
              key={j} 
              className="text-center group" 
              href={item.link || "#"}
              target={item.link ? "_blank" : undefined}
              rel={item.link ? "noopener noreferrer" : undefined}
            >
              <div className="bg-gray-100 h-14 w-14 mx-auto rounded-md overflow-hidden mb-1 group-hover:opacity-90 transition-opacity">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/56?text=No+Image";
                    }}
                  />
                )}
              </div>
              <p className="text-xs line-clamp-2 group-hover:underline">{item.name}</p>
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Get appropriate icon for a property
  const getPropertyIcon = (key: string) => {
    const iconMap: {[key: string]: React.ReactNode} = {
      population: <User className="h-4 w-4 mr-2" />,
      mayor: <User className="h-4 w-4 mr-2" />,
      area: <MapPin className="h-4 w-4 mr-2" />,
      elevation: <MountainSnow className="h-4 w-4 mr-2" />,
      neighborhoods: <Building className="h-4 w-4 mr-2" />,
      first_appeared: <Calendar className="h-4 w-4 mr-2" />,
      developer: <User className="h-4 w-4 mr-2" />,
      designed_by: <User className="h-4 w-4 mr-2" />,
      stable_release: <Info className="h-4 w-4 mr-2" />,
    };
    
    return iconMap[key] || null;
  };
  
  // Format a property key for display
  const formatPropertyKey = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Render value based on type
  const renderPropertyValue = (value: any): React.ReactNode => {
    // Handle arrays of link objects
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && (value[0].link || value[0].text)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, i) => {
            // Skip "See more" links to avoid clutter
            if (item.text === "See more") return null;
            
            return (
              <a 
                key={i} 
                href={item.link} 
                className="text-blue-600 hover:underline flex items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.text || item.name}
                {i < value.length - 1 && value.length > 1 && item.text !== "See more" && (
                  <span className="mx-1 text-gray-400">•</span>
                )}
              </a>
            );
          })}
        </div>
      );
    }
    
    // Handle web_results special case
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0].title && value[0].link) {
      return (
        <div className="flex flex-col gap-1">
          {value.map((item, i) => (
            <a 
              key={i} 
              href={item.link} 
              className="text-blue-600 hover:underline flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.title} <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          ))}
        </div>
      );
    }
    
    // Handle simple arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return "-";
      return value.join(', ');
    }
    
    // Handle simple objects
    if (typeof value === 'object' && value !== null) {
      // Ignore empty objects
      if (Object.keys(value).length === 0) return "-";
      return JSON.stringify(value);
    }
    
    // Handle primitive values
    return value;
  };

  const renderAttributeSection = () => {
    if (!attributes) return null;
    
    // Skip these attributes that are handled elsewhere or not meant for display
    const skipAttributes = [
      "entity_type", "knowledge_graph_search_link", "serpapi_knowledge_graph_search_link", 
      "header_images", "source", "patron_saint", "patron_saint_links", "chicory_coffee", 
      "coffee_books", "people_also_search_for", "list", "see_results_about", "type",
      "kgmid", "nickname", "nickname_links", "neighborhoods_links", "mayor_links", "area1",
      "web_results", "web_results_link"
    ];
    
    const relevantAttributes = Object.entries(attributes)
      .filter(([key, value]) => {
        // Skip keys in skipAttributes list
        if (skipAttributes.includes(key)) return false;
        
        // Skip null, undefined or empty string values
        if (value === null || value === undefined || value === "") return false;
        
        // Skip empty arrays
        if (Array.isArray(value) && value.length === 0) return false;
        
        // Skip empty objects
        if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Sort specific important attributes first
        const priorityOrder = ["population", "mayor", "area", "designed_by", "developer", "first_appeared"];
        const aIndex = priorityOrder.indexOf(a[0]);
        const bIndex = priorityOrder.indexOf(b[0]);
        
        if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
        if (aIndex >= 0) return -1;
        if (bIndex >= 0) return 1;
        
        // Otherwise sort alphabetically
        return a[0].localeCompare(b[0]);
      });
    
    if (relevantAttributes.length === 0) return null;
    
    return (
      <div className="border-t border-gray-200 pt-3 mb-4">
        <h3 className="font-medium mb-2">Facts</h3>
        <div className="text-sm">
          {relevantAttributes.map(([key, value]) => {
            // Format the key name for display
            const displayKey = formatPropertyKey(key);
            const icon = getPropertyIcon(key);
            
            return (
              <div key={key} className="flex py-2 border-b border-gray-100 last:border-b-0">
                <div className="text-gray-700 flex items-center w-1/3">
                  {icon}
                  <span>{displayKey}</span>
                </div>
                <div className="flex flex-wrap items-center w-2/3">
                  <span className="font-medium">{renderPropertyValue(value)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-amber-50 p-2 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-medium mb-1">{title}</h2>
              {type && <p className="text-gray-500 mb-2">{type}</p>}
            </div>
          </div>
          <Share2 className="h-5 w-5 text-gray-500" />
        </div>

        {header_images && header_images.length > 0 && (
          <div className="grid grid-cols-2 gap-1 mb-4">
            {header_images.slice(0, 4).map((img, i) => (
              <div key={i} className="bg-gray-100 h-20 md:h-32 rounded overflow-hidden">
                <img 
                  src={img.image} 
                  alt={`${title} ${i + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
              </div>
            ))}
            {header_images.length > 4 && (
              <div className="absolute bottom-2 right-2 bg-white text-xs px-2 py-1 rounded-sm shadow">
                More images
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-700 mb-3">{description || "No description available."}</p>
        
        {source && (
          <p className="text-xs text-gray-500 mb-4">
            <span className="font-medium">Source:</span>{" "}
            {source.link ? (
              <a href={source.link} className="hover:underline" target="_blank" rel="noopener noreferrer">
                {source.name}
              </a>
            ) : (
              source.name
            )}
          </p>
        )}

        {/* Display additional attributes like population, mayor, etc. */}
        {renderAttributeSection()}

        {renderNutritionSection()}

        {/* Render people also search for section if available */}
        {people_also_search_for && people_also_search_for.length > 0 && 
          renderImageSection(people_also_search_for, "People also search for")}
        
        {/* Render any coffee_books data if available */}
        {coffee_books && coffee_books.length > 0 && 
          renderImageSection(coffee_books, "Related Books")}
        
        {/* Render chicory_coffee data if available */}
        {chicory_coffee && chicory_coffee.length > 0 && 
          renderImageSection(chicory_coffee, "Related Products")}

        {see_results_about && see_results_about.length > 0 && (
          <div className="border-t border-gray-200 pt-3 mb-4">
            <h3 className="font-medium mb-2">See results about</h3>
            <div className="flex items-center">
              {see_results_about[0].image && (
                <div className="h-16 w-16 rounded-md overflow-hidden mr-3">
                  <img 
                    src={see_results_about[0].image} 
                    alt={see_results_about[0].name} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/64?text=No+Image";
                    }}
                  />
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

        {/* Display any patron saint information */}
        {patron_saint && (
          <div className="border-t border-gray-200 pt-3 mb-4">
            <h3 className="font-medium mb-2">Patron Saint</h3>
            <p className="text-sm">{patron_saint}</p>
            {patron_saint_links && patron_saint_links.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {patron_saint_links.map((link, i) => (
                  <a 
                    key={i}
                    href={link.patron_saint_link}
                    className="text-xs text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.patron_saint_text}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgePanel;

