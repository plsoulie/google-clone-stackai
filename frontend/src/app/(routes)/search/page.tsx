'use client';

import React from "react";
import { useSearchParams } from "@/hooks";
import Header from "@/components/Header";
import SearchResults from "@/components/SearchResults";

export default function SearchPage() {
  const { getQuery } = useSearchParams();
  const query = getQuery();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isSearchPage={true} />
      
      <main className="container mx-auto px-4 py-4 flex-grow">
        {query ? (
          <SearchResults query={query} />
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No search query provided. Try searching for something!</p>
          </div>
        )}
      </main>
    </div>
  );
} 