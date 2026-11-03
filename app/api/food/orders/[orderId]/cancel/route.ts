import { NextRequest, NextResponse } from 'next/server';
import { foodService } from '@/services/food/foodService';

export async function POST(
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
    await provider.cancelOrder(orderId);

    return NextResponse.json({
      success: true,
      message: `Order #${orderId} cancelled successfully.`
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Could not cancel order.' },
      { status: 500 }
    );
  }
}
