'use client';

import React from "react";

interface HeaderProps {
  isSearchPage?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSearchPage = false }) => {
  return (
    <header className={`border-b border-gray-200 ${isSearchPage ? 'sticky top-0 z-10' : ''} bg-white`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img 
            src="/stackai-search-logo.png" 
            alt="StackAI Search Logo" 
            className={`${isSearchPage ? 'h-10' : 'h-12'}`} 
          />
        </a>
        <div className="flex items-center space-x-3">
          <a href="#" className="py-2 px-4 bg-gray-100 text-center rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
            Log In
          </a>
          <a href="#" className="py-2 px-4 bg-black text-white text-center rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
            Sign Up
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header; 