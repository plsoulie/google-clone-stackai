/*
import React from "react";
import { Home, Database, Link2, BarChart2, ChevronDown, Square } from "lucide-react";

interface SideBarProps {
  userName?: string;
  userInitial?: string;
}

const SideBar: React.FC<SideBarProps> = ({ 
  userName = "Missing Name", 
  userInitial = "M" 
}) => {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header with logo */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/logo.svg" 
            alt="StackAI Logo" 
            className="h-8 w-8 mr-2" 
          />
          <span className="text-xl font-semibold">StackAI</span>
        </div>
        <button className="text-gray-600">
          <Square size={20} />
        </button>
      </div>
      
      {/* User profile section */}
      <div className="p-4 flex items-center">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-xl">{userInitial}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-md font-medium">{userName}</span>
          <span className="text-sm text-gray-500">Free</span>
        </div>
        <button className="ml-auto text-gray-400">
          <ChevronDown size={20} />
        </button>
      </div>
      
      {/* Navigation items */}
      <nav className="mt-2">
        <div className="bg-gray-100 p-4 flex items-center">
          <Home className="w-5 h-5 mr-3 text-gray-800" />
          <span className="text-lg text-gray-800">Projects</span>
        </div>
        
        <div className="p-4 flex items-center">
          <Database className="w-5 h-5 mr-3 text-gray-700" />
          <span className="text-lg text-gray-700">Knowledge Bases</span>
        </div>
        
        <div className="p-4 flex items-center">
          <Link2 className="w-5 h-5 mr-3 text-gray-700" />
          <span className="text-lg text-gray-700">Connections</span>
        </div>
        
        <div className="p-4 flex items-center">
          <BarChart2 className="w-5 h-5 mr-3 text-gray-700" />
          <span className="text-lg text-gray-700">Project Analytics</span>
        </div>
      </nav>
      
      {/* Spacer to push content to the top */}
      <div className="flex-grow"></div>
    </div>
  );
};

export default SideBar;
*/ 