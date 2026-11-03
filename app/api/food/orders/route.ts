import { NextRequest, NextResponse } from 'next/server';
import { foodService } from '@/services/food/foodService';
import { CreateFoodOrderRequest } from '@/types/food';
import { foodDb } from '@/lib/food-db';

export async function GET(req: NextRequest) {
  try {
    const orders = foodDb.getOrders();
    // Sort most recent first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: orders
    });
  } catch (error: any) {
    console.error('Error listing orders:', error);
    return NextResponse.json(
      { success: false, error: 'Could not retrieve orders list.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateFoodOrderRequest = await req.json();

    // 1. Validation
    if (!body.trainNumber || !body.stationCode || !body.stationName) {
      return NextResponse.json({ success: false, error: 'Train details and delivery station are required.' }, { status: 400 });
    }

    if (!body.passengerName?.trim() || !body.passengerPhone?.trim()) {
      return NextResponse.json({ success: false, error: 'Passenger name and phone are required.' }, { status: 400 });
    }

    if (!body.coach?.trim() || !body.seat?.trim()) {
      return NextResponse.json({ success: false, error: 'Coach and seat allocations are required for delivery.' }, { status: 400 });
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart cannot be empty.' }, { status: 400 });
    }

    // 2. Delegate to active provider which securely recalculates prices & tax
    const provider = foodService.getProvider();
    const createdOrder = await provider.createOrder(body);

    return NextResponse.json({
      success: true,
      data: createdOrder
    });
  } catch (error: any) {
    console.error('Error creating food order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Your order could not be placed.' },
      { status: 500 }
    );
  }
}
