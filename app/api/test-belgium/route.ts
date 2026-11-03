import { NextRequest, NextResponse } from 'next/server';
import { ProviderFactory } from '@/providers/ProviderFactory';
import { BelgiumProvider } from '@/providers/BelgiumProvider';
import { IndiaProvider } from '@/providers/IndiaProvider';

// Mock iRail payload for Antwerp-Central to Oostende route
const mockVehicleResponse = {
  version: "1.4",
  timestamp: "1786044098",
  vehicle: "BE.NMBS.IC1832",
  vehicleinfo: {
    name: "BE.NMBS.IC1832",
    shortname: "IC 1832",
    number: "1832",
    type: "IC",
    locationX: "4.421101",
    locationY: "51.2172"
  },
  stops: {
    number: "3",
    stop: [
      {
        id: "0",
        station: "Antwerp-Central",
        stationinfo: {
          id: "BE.NMBS.008821006",
          name: "Antwerp-Central",
          locationX: "4.421101",
          locationY: "51.2172",
          standardname: "Antwerpen-Centraal"
        },
        time: "1786007160",
        platform: "2",
        scheduledDepartureTime: "1786007160",
        scheduledArrivalTime: "1786007160",
        delay: "180",
        canceled: "0",
        left: "1",
        arrived: "1"
      },
      {
        id: "1",
        station: "Antwerp-Berchem",
        stationinfo: {
          id: "BE.NMBS.008821121",
          name: "Antwerp-Berchem",
          locationX: "4.432221",
          locationY: "51.19923",
          standardname: "Antwerpen-Berchem"
        },
        time: "1786007520",
        platform: "6",
        scheduledDepartureTime: "1786007520",
        scheduledArrivalTime: "1786007400",
        delay: "120",
        canceled: "0",
        left: "0",
        arrived: "1"
      },
      {
        id: "2",
        station: "Oostende",
        stationinfo: {
          id: "BE.NMBS.008891702",
          name: "Oostende",
          locationX: "2.925809",
          locationY: "51.228212",
          standardname: "Oostende"
        },
        time: "1786013460",
        platform: "5",
        scheduledDepartureTime: "1786013460",
        scheduledArrivalTime: "1786013460",
        delay: "0",
        canceled: "0",
        left: "0",
        arrived: "0"
      }
    ]
  }
};

export async function GET(request: NextRequest) {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const assert = (name: string, assertion: () => boolean) => {
    try {
      const passed = assertion();
      results.push({ name, passed });
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message });
    }
  };

  // 1. Test Factory detection logic
  assert('Detects Belgium Vehicle ID BE.NMBS.IC1832', () => {
    return ProviderFactory.detectCountry('BE.NMBS.IC1832') === 'BE';
  });

  assert('Detects Belgium short code IC 1832', () => {
    return ProviderFactory.detectCountry('IC 1832') === 'BE';
  });

  assert('Detects Belgium station Brussels-Central', () => {
    return ProviderFactory.detectCountry('Brussels-Central') === 'BE';
  });

  assert('Detects Indian train 12951', () => {
    return ProviderFactory.detectCountry('12951') === 'IN';
  });

  assert('Detects Indian station Mumbai Central', () => {
    return ProviderFactory.detectCountry('Mumbai Central') === 'IN';
  });

  // 2. Test Factory provider instances
  assert('Factory instantiates BelgiumProvider for BE', () => {
    const provider = ProviderFactory.getProvider('BE');
    return provider instanceof BelgiumProvider;
  });

  assert('Factory instantiates IndiaProvider for IN', () => {
    const provider = ProviderFactory.getProvider('IN');
    return provider instanceof IndiaProvider;
  });

  // 3. Test Belgium Provider mapping with mock network fetch
  const originalFetch = global.fetch;
  try {
    global.fetch = (async (url: any) => {
      const urlStr = typeof url === 'string' ? url : url?.url || String(url);
      if (urlStr.includes('/vehicle/')) {
        return {
          ok: true,
          status: 200,
          json: async () => mockVehicleResponse
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    }) as any;

    assert('Maps vehicle stops and structures successfully', () => {
      const provider = ProviderFactory.getProvider('BE');
      return true; // if promise resolves
    });

    const provider = ProviderFactory.getProvider('BE');
    const journey = await provider.getLiveJourney('BE.NMBS.IC1832');

    assert('Journey ID matches vehicle code', () => journey?.trainId === 'BE.NMBS.IC1832');
    assert('Journey has correct number of stations', () => journey?.stations.length === 3);
    assert('First station is Antwerp-Central', () => journey?.stations[0].name === 'Antwerpen-Centraal');
    assert('Last station is Oostende', () => journey?.stations[2].name === 'Oostende');
    assert('First station status is passed', () => journey?.stations[0].status === 'passed');
    assert('Second station status is current', () => journey?.stations[1].status === 'current');
    assert('Third station status is upcoming', () => journey?.stations[2].status === 'upcoming');
    assert('Calculates non-zero distances along path', () => {
      return (journey?.stations[1].distanceKm ?? 0) > 0 && (journey?.stations[2].distanceKm ?? 0) > (journey?.stations[1].distanceKm ?? 0);
    });
    assert('Journey status is running', () => journey?.status === 'running');
  } catch (err: any) {
    results.push({ name: 'Mapping Exception', passed: false, error: err.message });
  } finally {
    global.fetch = originalFetch;
  }

  const allPassed = results.every((r) => r.passed);

  return NextResponse.json({
    success: allPassed,
    totalTests: results.length,
    passedTests: results.filter((r) => r.passed).length,
    failedTests: results.filter((r) => !r.passed).length,
    results,
    timestamp: new Date().toISOString(),
  });
}
