import { NextRequest, NextResponse } from 'next/server';
import { foodService } from '@/services/food/foodService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stationCode = searchParams.get('stationCode');

  if (!stationCode) {
    return NextResponse.json(
      { success: false, error: 'stationCode parameter is required.' },
      { status: 400 }
    );
  }

  try {
    const provider = foodService.getProvider();
    const restaurants = await provider.getRestaurants(stationCode);
    const isDemo = foodService.isDemoMode();

    return NextResponse.json({
      success: true,
      data: {
        restaurants,
        mode: isDemo ? 'Demo Ordering' : 'Production'
      }
    });
  } catch (error: any) {
    console.error('Error fetching food restaurants:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'No restaurants available at this station.' },
      { status: 500 }
    );
  }
}
