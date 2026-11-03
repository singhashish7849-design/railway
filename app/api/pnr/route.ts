import { NextRequest, NextResponse } from 'next/server';
import { checkPNRStatus } from '@/lib/railkit';
import { ApiResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pnr = searchParams.get('pnr');

  if (!pnr) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'PNR number is required (?pnr=10-digit-number)', timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }

  try {
    const result = await checkPNRStatus(pnr);

    if (!result || result.success === false) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result?.error || 'Failed to check PNR status.', timestamp: new Date().toISOString() },
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
      { success: false, error: err.message || 'Failed to connect to PNR system.', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
