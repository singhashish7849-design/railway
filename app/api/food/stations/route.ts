import { NextRequest, NextResponse } from 'next/server';
import { foodService } from '@/services/food/foodService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trainNumber = searchParams.get('trainNumber');

  if (!trainNumber) {
    return NextResponse.json(
      { success: false, error: 'trainNumber parameter is required.' },
      { status: 400 }
    );
  }

  try {
    const provider = foodService.getProvider();
    const stations = await provider.getStations(trainNumber);
    const isDemo = foodService.isDemoMode();

    return NextResponse.json({
      success: true,
      data: {
        stations,
        mode: isDemo ? 'Demo Ordering' : 'Production'
      }
    });
  } catch (error: any) {
    console.error('Error fetching food stations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Food ordering is temporarily unavailable.' },
      { status: 500 }
    );
  }
}
