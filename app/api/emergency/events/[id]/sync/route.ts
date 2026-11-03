import { NextRequest, NextResponse } from 'next/server';
import { emergencyDb } from '@/lib/emergency-db';
import { EmergencyEvent } from '@/types/emergency';
import { ApiResponse } from '@/types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const event = (await request.json()) as EmergencyEvent;

    if (!event || event.id !== id) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Mismatched or invalid emergency event payload for sync',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Save/update in database, ensuring it is marked as synced
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
