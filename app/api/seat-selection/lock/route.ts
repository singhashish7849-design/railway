import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { lockSeatAtomic } from '@/lib/seat-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { trainNumber, journeyDate, coachNumber, seatNumber, passengerName, passengerAge, passengerGender } = body;

    // 1. Validate parameters
    if (!trainNumber || !journeyDate || !coachNumber || seatNumber === undefined) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Missing required reservation fields (trainNumber, journeyDate, coachNumber, seatNumber)',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (!passengerName || !passengerAge || !passengerGender) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Passenger name, age, and gender are required to lock a preferred seat.',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // 2. Perform atomic lock operation
    const lockResult = await lockSeatAtomic(
      trainNumber,
      journeyDate,
      coachNumber,
      parseInt(seatNumber),
      'railway-provider' // Source
    );

    if (!lockResult.success) {
      // Return 409 Conflict for race condition
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: lockResult.message,
          timestamp: new Date().toISOString()
        },
        { status: 409 }
      );
    }

    return NextResponse.json<ApiResponse<{ message: string; snapshot: any }>>({
      success: true,
      data: {
        message: lockResult.message,
        snapshot: lockResult.snapshot
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: err.message || 'Failed to complete seat selection lock.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
