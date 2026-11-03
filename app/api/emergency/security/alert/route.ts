import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  // Direct integration endpoint is kept disabled because no authorized security provider integration exists.
  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      error: 'Direct onboard security alert endpoint is disabled. No authorized security provider integration exists.',
      timestamp: new Date().toISOString()
    },
    { status: 501 } // Not Implemented
  );
}
