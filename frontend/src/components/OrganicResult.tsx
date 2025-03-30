import React from "react";
import { ExternalLink } from "lucide-react";

interface OrganicResultProps {
  title: string;
  url: string;
  description: string;
  breadcrumbs?: string[];
  metadata?: {
    [key: string]: string;
  };
  tags?: string[];
}

const OrganicResult: React.FC<OrganicResultProps> = ({
  title,
  url,
  description,
  breadcrumbs,
  metadata,
  tags,
}) => {
  // Format display URL
  const displayUrl = new URL(url).hostname + new URL(url).pathname;
  
  // Generate favicon URL
  const hostname = new URL(url).hostname;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    <div className="mb-4 border border-gray-200 rounded-md overflow-hidden p-4 bg-white h-full flex flex-col">
      <div className="flex-1">
        {breadcrumbs && (
          <div className="flex text-sm text-gray-500 items-center mb-1">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-1">›</span>}
                <span>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        
        <div className="flex items-center mb-1">
          <img 
            src={faviconUrl} 
            alt={`${hostname} logo`} 
            className="w-5 h-5 mr-2 flex-shrink-0"
            onError={(e) => {
              // If favicon fails to load, hide the image
              e.currentTarget.style.display = 'none';
            }}
          />
          <h3 className="text-lg text-gray-800 font-medium hover:underline line-clamp-2">
            <a href={url} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          </h3>
        </div>

        <div className="flex items-center text-green-700 text-sm mb-2">
          <span className="truncate max-w-[90%]">{displayUrl}</span>
          {metadata?.type === "info" && (
            <button className="ml-1 text-gray-500">
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>

        <p className="text-sm text-gray-700 line-clamp-3">{description}</p>
      </div>

      {tags && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganicResult;
