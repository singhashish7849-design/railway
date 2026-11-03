import { SearchResult, LiveJourney } from '@/types/train';

export interface ITrainProvider {
  searchTrains(query: string): Promise<SearchResult[]>;
  getLiveJourney(trainId: string): Promise<LiveJourney | null>;
  getLiveBoard?(stationName: string): Promise<SearchResult[]>;
}
