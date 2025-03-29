
import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Image, Newspaper, MoreHorizontal } from "lucide-react";

interface SearchFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: "all", label: "All", icon: null },
    { id: "maps", label: "Maps", icon: MapPin },
    { id: "images", label: "Images", icon: Image },
    { id: "news", label: "News", icon: Newspaper },
    { id: "more", label: "More", icon: MoreHorizontal },
  ];

  return (
    <div className="flex items-center space-x-1 mt-1 border-b border-gray-200 pb-1">
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.id}
            variant="ghost"
            size="sm"
            className={`px-3 py-1 rounded-md text-sm ${
              activeFilter === filter.id
                ? "text-blue-600 font-medium border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => onFilterChange(filter.id)}
          >
            <div className="flex items-center gap-1">
              {Icon && <Icon className="h-4 w-4 mr-1" />}
              {filter.label}
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default SearchFilters;
