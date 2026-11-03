# RailGaadi Multi-Country Provider Architecture

This project is built using a clean, extensible **Provider-Factory Pattern** to support train tracking and search operations across multiple countries.

---

## Architecture Overview

```
                      +-------------------+
                      |  ProviderFactory  |
                      +---------+---------+
                                |
                                v
                      +---------+---------+
                      |  ITrainProvider   |
                      +----+---------+----+
                           |         |
            +--------------+         +--------------+
            |                                       |
            v                                       v
  +---------+---------+                   +---------+---------+
  |   IndiaProvider   |                   |  BelgiumProvider  |
  +---------+---------+                   +---------+---------+
            |                                       |
            v                                       v
    (RailRadar API)                            (iRail API)
```

1. **`ITrainProvider`**: The common interface contract that all country-specific rail integrations must implement.
2. **`IndiaProvider`**: Wraps the existing Indian Railways integration (powered by RailRadar).
3. **`BelgiumProvider`**: Connects to iRail API endpoints to parse departures (Liveboard) and vehicle stopping route points (Vehicles), calculating station path distances and interpolating coordinates.
4. **`ProviderFactory`**: Resolves requests to the appropriate provider based on a country code parameter (`?country=BE`) or auto-detection heuristics (e.g. checking train ID formats like `BE.NMBS.*` or matching country station keywords).

---

## Domain Data Mapping

All providers translate country-specific JSON response structures into unified, internal typescript models:

- **`SearchResult`**: Used for search suggestions, quick chips, and liveboard listings.
- **`LiveJourney`**: Contains real-time GPS locations, route geometries, timing details, current/previous/next stations, and status indicators.

The React frontend handles these unified models natively, meaning it remains completely decoupled from country-specific API implementations.

---

## Adding a New Country (e.g. Germany)

To add support for a new country (e.g. Germany `DE` using Deutsche Bahn API), you only need to follow three simple steps:

### Step 1: Create a Provider Class
Create a new file `providers/GermanyProvider.ts` that implements `ITrainProvider`:

```typescript
import { ITrainProvider } from './ITrainProvider';
import { SearchResult, LiveJourney } from '@/types/train';

export class GermanyProvider implements ITrainProvider {
  async searchTrains(query: string): Promise<SearchResult[]> {
    // 1. Query Deutsche Bahn lookup/liveboard endpoints
    // 2. Map response to SearchResult[]
  }

  async getLiveJourney(trainId: string): Promise<LiveJourney | null> {
    // 1. Fetch DB vehicle status
    // 2. Map response to unified LiveJourney
  }
}
```

### Step 2: Register in `ProviderFactory.ts`
Open `providers/ProviderFactory.ts` and add the new provider:

```typescript
import { GermanyProvider } from './GermanyProvider';

export class ProviderFactory {
  // ...
  private static germanyProvider = new GermanyProvider();

  static getProvider(country?: string): ITrainProvider {
    const c = (country || 'IN').toUpperCase();
    switch (c) {
      case 'DE':
        return this.germanyProvider;
      case 'BE':
        return this.belgiumProvider;
      case 'IN':
      default:
        return this.indiaProvider;
    }
  }

  static detectCountry(query: string): string {
    // Add regex or keyword checks for German trains (e.g., ICE, DB)
    if (query.toUpperCase().startsWith('ICE')) return 'DE';
    // ...
  }
}
```

### Step 3: Configure Base URLs
Add the base URL to `.env.example`, `.env`, and `config/env.ts`:
```env
GERMANY_RAIL_BASE_URL=https://api.deutschebahn.com/
```

No modifications are needed in the UI components, page layouts, map renderers, or timeline visuals, keeping the codebase fully backward compatible and conforming to the open-closed principle (OCP).
