
import React from "react";
import { Clock, History, MapPin, Image, Newspaper, Home, MoreHorizontal, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface SearchSidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchHistory: string[];
  onHistoryItemClick: (query: string) => void;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({
  activeFilter,
  onFilterChange,
  searchHistory,
  onHistoryItemClick,
}) => {
  const filters = [
    { id: "all", label: "All", icon: Home },
    { id: "maps", label: "Maps", icon: MapPin },
    { id: "images", label: "Images", icon: Image },
    { id: "news", label: "News", icon: Newspaper },
    { id: "more", label: "More", icon: MoreHorizontal },
  ];

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="flex items-center h-16 px-4">
        <div className="flex items-center">
          <img src="/lovable-uploads/2bacea9e-1086-4721-b6ed-a3ea64b4bd15.png" alt="StackAI Logo" className="h-8" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-stackai-gray text-xs font-medium">Filters</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filters.map((filter) => (
                <SidebarMenuItem key={filter.id}>
                  <SidebarMenuButton 
                    isActive={activeFilter === filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={cn(
                      "gap-3 h-9 w-full",
                      activeFilter === filter.id ? "text-stackai-accent bg-white/10" : "text-stackai-gray"
                    )}
                  >
                    <filter.icon className="w-4 h-4" />
                    <span className="font-medium">{filter.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {searchHistory.length > 0 && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="flex items-center text-stackai-gray text-xs font-medium">
              <History className="w-4 h-4 mr-2" />
              Search History
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {searchHistory.map((query, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton 
                      onClick={() => onHistoryItemClick(query)}
                      className="gap-3 h-9 w-full text-stackai-gray hover:text-stackai-accent truncate"
                    >
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{query}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4 mt-auto">
        <div className="flex flex-col space-y-4">
          <div className="text-xs text-stackai-gray flex flex-row justify-between">
            <span>1 of 2</span>
          </div>
          <button className="flex items-center space-x-2 bg-stackai-dark hover:bg-black transition-colors text-white rounded-md py-2 px-4 w-full justify-center">
            <span className="font-medium">Upgrade</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SearchSidebar;
