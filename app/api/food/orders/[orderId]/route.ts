import { NextRequest, NextResponse } from 'next/server';
import { foodService } from '@/services/food/foodService';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const orderId = params.orderId;

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: 'orderId parameter is required.' },
      { status: 400 }
    );
  }

  try {
    const provider = foodService.getProvider();
    const order = await provider.getOrderStatus(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order #${orderId} was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Could not retrieve order details.' },
      { status: 500 }
    );
  }
}
