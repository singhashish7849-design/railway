import { ITrainProvider } from './ITrainProvider';
import { IndiaProvider } from './IndiaProvider';
import { BelgiumProvider } from './BelgiumProvider';

export class ProviderFactory {
  private static indiaProvider = new IndiaProvider();
  private static belgiumProvider = new BelgiumProvider();

  /**
   * Returns the appropriate provider based on country code.
   */
  static getProvider(country?: string): ITrainProvider {
    const c = (country || 'IN').toUpperCase();
    switch (c) {
      case 'BE':
        return this.belgiumProvider;
      case 'IN':
      default:
        return this.indiaProvider;
    }
  }

  /**
   * Detects the country code based on the format of the train ID / search query.
   */
  static detectCountry(query: string): string {
    const q = query.trim().toUpperCase();
    if (!q) return 'IN';

    // Belgium train ID/vehicle patterns
    if (q.startsWith('BE.NMBS.')) {
      return 'BE';
    }

    // Belgium train short codes (e.g. "IC 1832", "S8 3970", etc.)
    if (/^(IC|S\d*|L|P|TGV|ICE|EST)\s*\d+$/i.test(q)) {
      return 'BE';
    }

    // Belgium popular stations list
    const belgiumKeywords = [
      'BRUSSELS', 'BRUSSEL', 'BRUXELLES',
      'ANTWERP', 'ANTWERPEN', 'ANVERS',
      'GHENT', 'GENT', 'GAND',
      'BRUGGE', 'BRUGES',
      'OOSTENDE', 'OSTEND',
      'LIEGE', 'LIÈGE',
      'NAMUR',
      'CHARLEROI',
      'LOKEREN',
      'SINT-NIKLAAS',
      'BEVEREN',
      'MONS',
      'KORTRIJK',
      'LEUVEN',
      'HASSELT',
      'ESSEN'
    ];

    const words = q.split(/[\s,.\-\/]+/);
    const hasBelgiumWord = words.some(w => belgiumKeywords.includes(w));
    if (hasBelgiumWord) {
      return 'BE';
    }

    // Default fallback to India
    return 'IN';
  }
}
