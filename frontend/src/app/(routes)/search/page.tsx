'use client';

import React, { Suspense } from "react";
import { useSearchParams } from "@/hooks";
import Header from "@/components/Header";
import SearchResults from "@/components/SearchResults";

function SearchContent() {
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

// Loading fallback for Suspense
function SearchLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isSearchPage={true} />
      
      <main className="container mx-auto px-4 py-4 flex-grow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
} 