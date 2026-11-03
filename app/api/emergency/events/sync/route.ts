import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { emergencyDb } from '@/lib/emergency-db';
import { ApiResponse } from '@/types/api';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 1. Authenticate user server-side
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Unauthorized. Authenticated session required for SMS alerts.',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, commId, message } = body;

    if (!eventId || !commId || !message) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Missing required alert sync parameters.',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // 2. Fetch primary emergency contact from Database
    const { data: contacts, error: dbError } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('userId', user.id);

    if (dbError || !contacts || contacts.length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'No emergency contacts found for this user.',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // Find primary or default to first contact
    const primaryContact = contacts.find((c: any) => c.isPrimary) || contacts[0];
    const parentPhone = primaryContact.phone;

    // 3. Dispatch Twilio SMS
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      console.error('Twilio credentials not configured in environment variables');
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Twilio SMS service is not currently configured on the server.',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    const twilioClient = twilio(accountSid, authToken);

    try {
      const twilioResponse = await twilioClient.messages.create({
        body: message,
        from: fromPhone,
        to: parentPhone
      });

      console.log(`Emergency SMS successfully dispatched to ${parentPhone}. SID: ${twilioResponse.sid}`);

      // 4. Log communication record in Supabase
      const { error: commError } = await supabase.from('emergency_communications').insert({
        id: commId.startsWith('comm_') ? undefined : commId, // Use default UUID if commId is a mock string
        eventId,
        recipient: `${primaryContact.name} (${parentPhone})`,
        status: 'SENT',
        type: 'SMS',
        sentAt: new Date().toISOString()
      });

      if (commError) {
        console.warn('Failed to insert emergency communication log to Supabase:', commError);
      }

      // Log locally in JSON database to maintain compatibility
      emergencyDb.createCommunication({
        id: commId,
        emergencyEventId: eventId,
        type: 'SMS',
        recipient: `${primaryContact.name} (${parentPhone})`,
        status: 'SENT',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString()
      });

      return NextResponse.json<ApiResponse<any>>({
        success: true,
        data: { sid: twilioResponse.sid, recipient: primaryContact.name },
        timestamp: new Date().toISOString()
      });

    } catch (twilioErr: any) {
      console.error('Twilio API call failure:', twilioErr);
      
      // Log failure in database
      await supabase.from('emergency_communications').insert({
        eventId,
        recipient: `${primaryContact.name} (${parentPhone})`,
        status: 'FAILED',
        type: 'SMS'
      }).select().maybeSingle();

      emergencyDb.createCommunication({
        id: commId,
        emergencyEventId: eventId,
        type: 'SMS',
        recipient: `${primaryContact.name} (${parentPhone})`,
        status: 'FAILED',
        createdAt: new Date().toISOString()
      });

      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: `Twilio dispatch failed: ${twilioErr.message || 'SMS transmission failure'}`,
          timestamp: new Date().toISOString()
        },
        { status: 502 }
      );
    }

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
