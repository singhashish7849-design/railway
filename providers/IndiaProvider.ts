import { ITrainProvider } from './ITrainProvider';
import { SearchResult, LiveJourney } from '@/types/train';
import { searchTrains, getLiveJourney } from '@/lib/railradar';

export class IndiaProvider implements ITrainProvider {
  async searchTrains(query: string): Promise<SearchResult[]> {
    return searchTrains(query);
  }

  async getLiveJourney(trainId: string): Promise<LiveJourney | null> {
    return getLiveJourney(trainId);
  }
}
