'use client';

import { useQuery } from '@tanstack/react-query';
import { WindowViewResponse } from '@/types/windowView';
import { ApiResponse } from '@/types/api';
import { useJourneyStore } from '@/store/journey';

async function fetchWindowView(trainNumber: string): Promise<WindowViewResponse> {
  const url = `/api/window-view?trainNumber=${trainNumber}`;
  const res = await fetch(url);
  const json: ApiResponse<WindowViewResponse> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to fetch Window View data');
  }
  return json.data;
}

export function useWindowView(trainNumber: string) {
  const autoRefresh = useJourneyStore((state) => state.autoRefresh);

  return useQuery({
    queryKey: ['windowView', trainNumber],
    queryFn: () => fetchWindowView(trainNumber),
    enabled: Boolean(trainNumber),
    refetchInterval: autoRefresh ? 20 * 1000 : false, // Poll every 20 seconds for window POIs
    staleTime: 10 * 1000, // Stale for 10 seconds
  });
}
