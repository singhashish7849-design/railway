import { NextRequest, NextResponse } from 'next/server';
import { foodService } from '@/services/food/foodService';

export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  const restaurantId = params.restaurantId;

  if (!restaurantId) {
    return NextResponse.json(
      { success: false, error: 'restaurantId is required.' },
      { status: 400 }
    );
  }

  try {
    const provider = foodService.getProvider();
    const menu = await provider.getMenu(restaurantId);

    return NextResponse.json({
      success: true,
      data: menu
    });
  } catch (error: any) {
    console.error('Error fetching restaurant menu:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'This restaurant menu is currently unavailable.' },
      { status: 500 }
    );
  }
}
