import { NextRequest, NextResponse } from 'next/server';
import { emergencyDb } from '@/lib/emergency-db';
import { EmergencyEvent } from '@/types/emergency';
import { ApiResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const event = (await request.json()) as EmergencyEvent;

    if (!event || !event.id || !event.trainNumber) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Invalid emergency event payload',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    emergencyDb.createEvent(event);

    return NextResponse.json<ApiResponse<EmergencyEvent>>({
      success: true,
      data: event,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
