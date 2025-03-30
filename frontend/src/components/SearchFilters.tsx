import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Image, Newspaper, MoreHorizontal, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SearchFilters: React.FC<SearchFiltersProps & SidebarProps> = ({ activeFilter, onFilterChange, collapsed, setCollapsed }) => {
  const filters = [
    { id: "all", label: "All", icon: null },
    { id: "maps", label: "Maps", icon: MapPin },
    { id: "images", label: "Images", icon: Image },
    { id: "news", label: "News", icon: Newspaper },
    { id: "more", label: "More", icon: MoreHorizontal },
  ];

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 sticky top-0",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      <div className="mt-2 flex-1 overflow-auto">
        <nav className="space-y-1 px-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.id}
                variant="ghost"
                size="sm"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  activeFilter === filter.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                onClick={() => onFilterChange(filter.id)}
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {!collapsed && <span>{filter.label}</span>}
              </Button>
            );
          })}
        </nav>
      </div>
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-4 bg-white border border-neutral-200 rounded-full p-1 shadow-md hover:shadow-lg"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
};

export default SearchFilters;
