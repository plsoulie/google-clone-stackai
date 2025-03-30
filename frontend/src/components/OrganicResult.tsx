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

  return (
    <div className="mb-6 max-w-2xl border border-gray-200 rounded-md overflow-hidden p-4 bg-white">
      <div className="flex items-start">
        <div>
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
          <h3 className="text-xl text-gray-800 font-medium hover:underline">
            <a href={url} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          </h3>
          <div className="flex items-center text-green-700 text-sm">
            <span>{displayUrl}</span>
            {metadata?.type === "info" && (
              <button className="ml-1 text-gray-500">
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-700">{description}</p>

          {tags && tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
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
      </div>
    </div>
  );
};

export default OrganicResult;
