import { NextRequest, NextResponse } from 'next/server';
import { emergencyDb } from '@/lib/emergency-db';
import { EmergencyEvent } from '@/types/emergency';
import { ApiResponse } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const event = emergencyDb.getEventById(id);

    if (!event) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: `Emergency event #${id} not found`,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

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
