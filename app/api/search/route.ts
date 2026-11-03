import { NextRequest, NextResponse } from 'next/server';
import { ProviderFactory } from '@/providers/ProviderFactory';
import { searchLocalTrains } from '@/lib/trains-db';
import { getCached, setCached } from '@/lib/cache';
import { ApiResponse } from '@/types/api';
import { SearchResult } from '@/types/train';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  let country = searchParams.get('country') || undefined;

  if (!country && query) {
    country = ProviderFactory.detectCountry(query);
  }

  const cacheKey = `search:${country || 'IN'}:${query.toLowerCase().trim()}`;

  const cached = getCached<SearchResult[]>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<SearchResult[]>>({
      success: true,
      data: cached,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const provider = ProviderFactory.getProvider(country);
    const results = await provider.searchTrains(query);
    setCached(cacheKey, results, query ? 600 : 120);

    return NextResponse.json<ApiResponse<SearchResult[]>>({
      success: true,
      data: results,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('[/api/search] Search failed, falling back to local DB if applicable:', err.message);

    let localResults: SearchResult[] = [];
    if (!country || country === 'IN') {
      localResults = searchLocalTrains(query).map((t) => ({
        id: t.number,
        number: t.number,
        name: t.name,
        origin: { code: t.fromCode, name: t.from },
        destination: { code: t.toCode, name: t.to },
      }));
    }

    return NextResponse.json<ApiResponse<SearchResult[]>>({
      success: true,
      data: localResults,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  }
}
