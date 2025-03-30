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
  subtitle?: string;
  description: string;
  source?: string;
  images?: string[];
  facts?: {
    title: string;
    items: NutritionFact[];
  };
  sections?: {
    title: string;
    items: Array<{
      name: string;
      image?: string;
    }>;
    moreLink?: string;
  }[];
}

const KnowledgePanel: React.FC<KnowledgePanelProps> = ({
  title,
  subtitle,
  description,
  source,
  images,
  facts,
  sections,
}) => {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between">
          <h2 className="text-2xl font-medium mb-1">{title}</h2>
          <Share2 className="h-5 w-5 text-gray-500" />
        </div>
        {subtitle && <p className="text-gray-500 mb-2">{subtitle}</p>}

        {images && images.length > 0 && (
          <div className="grid grid-cols-2 gap-1 mb-4">
            {images.slice(0, 4).map((image, i) => (
              <div key={i} className="bg-gray-100 h-20 md:h-32 rounded overflow-hidden">
                <img src={image} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {images.length > 4 && (
              <div className="absolute bottom-2 right-2 bg-white text-xs px-2 py-1 rounded-sm shadow">
                More images
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-700 mb-3">{description}</p>
        {source && (
          <p className="text-xs text-gray-500 mb-4">
            <span className="font-medium">Source:</span> {source}
          </p>
        )}

        {facts && (
          <div className="border-t border-gray-200 pt-3 mb-4">
            <h3 className="font-medium mb-2">{facts.title}</h3>
            <div className="text-sm">
              {facts.items.map((fact, i) => (
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
        )}

        {sections && sections.map((section, i) => (
          <div key={i} className="border-t border-gray-200 pt-3 mb-2 last:mb-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{section.title}</h3>
              {section.moreLink && (
                <a href="#" className="text-xs text-blue-600 flex items-center">
                  View {section.moreLink} <ChevronRight className="h-3 w-3 ml-1" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {section.items.slice(0, 4).map((item, j) => (
                <div key={j} className="text-center">
                  <div className="bg-gray-100 h-14 w-14 mx-auto rounded-md overflow-hidden mb-1">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <p className="text-xs">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgePanel;
