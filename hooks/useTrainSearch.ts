'use client';

import { useQuery } from '@tanstack/react-query';
import { SearchResult } from '@/types/train';
import { ApiResponse } from '@/types/api';

async function fetchSearchResults(query: string, country: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&country=${country}`);
  const json: ApiResponse<SearchResult[]> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to fetch search results');
  }
  return json.data;
}

export function useTrainSearch(query: string, country: string = 'IN') {
  return useQuery({
    queryKey: ['trainSearch', query, country],
    queryFn: () => fetchSearchResults(query, country),
    enabled: Boolean(query.trim()),
    staleTime: 30 * 1000,
  });
}
