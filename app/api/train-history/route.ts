import { NextRequest, NextResponse } from 'next/server';
import { getTrainHistory } from '@/lib/railkit';
import { ApiResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trainNumber = searchParams.get('trainNumber');
  const date = searchParams.get('date'); // DD-MM-YYYY format

  if (!trainNumber || !date) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Both trainNumber and date (DD-MM-YYYY) are required.', timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }

  try {
    const result = await getTrainHistory(trainNumber, date);

    if (!result || result.success === false) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result?.error || 'Failed to retrieve train history.', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: result.data || result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: err.message || 'Failed to connect to train history system.', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
