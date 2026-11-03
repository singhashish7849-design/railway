import { NextRequest, NextResponse } from 'next/server';
import { EmergencyContactProvider } from '@/services/emergency/emergencyContactService';
import { ApiResponse } from '@/types/api';
import { EmergencyContact } from '@/services/emergency/emergencyContactService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'IN';

    const contacts = EmergencyContactProvider.getContacts(country);

    return NextResponse.json<ApiResponse<EmergencyContact[]>>({
      success: true,
      data: contacts,
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
