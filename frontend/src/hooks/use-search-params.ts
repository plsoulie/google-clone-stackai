'use client';

import { useSearchParams as useNextSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();

  const getQuery = useCallback(() => {
    return searchParams.get('q') || '';
  }, [searchParams]);

  const updateQueryParam = useCallback((query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [router]);

  const removeQueryParam = useCallback(() => {
    router.push('/');
  }, [router]);

  return {
    getQuery,
    updateQueryParam,
    removeQueryParam,
    searchParams
  };
} 