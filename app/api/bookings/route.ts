import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { validatePNRFormat, normalizeAddBooking } from '@/lib/bookings/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const isDemo = request.cookies.get('railgaadi-demo-mode')?.value === 'true';

    // If unauthenticated and not demo mode
    if ((authError || !user) && !isDemo) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Please log in to view your bookings.'
        }
      }, { status: 401 });
    }

    // Demo Mode fallback for preview testing without live Supabase session
    if (!user && isDemo) {
      return NextResponse.json({
        success: true,
        bookings: []
      });
    }

    const { data: bookings, error: dbError } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.warn('[API /api/bookings GET] Database query fallback:', dbError.message);
      return NextResponse.json({
        success: true,
        bookings: []
      });
    }

    return NextResponse.json({
      success: true,
      bookings: bookings || []
    });
  } catch (err: any) {
    console.error('[API /api/bookings GET] Server exception:', err);
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'We couldn\'t load your bookings. Please try again.'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const isDemo = request.cookies.get('railgaadi-demo-mode')?.value === 'true';

    if ((authError || !user) && !isDemo) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Please log in to add bookings.'
        }
      }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { pnr } = body;

    if (!pnr || !validatePNRFormat(String(pnr))) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PNR',
          message: 'Invalid PNR. PNR must be exactly 10 numeric digits without spaces or special characters.'
        }
      }, { status: 400 });
    }

    const cleanPnr = String(pnr).trim();
    const activeUserId = user?.id || 'demo-user-id';

    // Check if PNR is already saved by this user if database connection is available
    if (user) {
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('pnr', cleanPnr)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'DUPLICATE_PNR',
            message: 'This PNR is already saved in your RailGaadi bookings.'
          }
        }, { status: 409 });
      }
    }

    const normalizedData = normalizeAddBooking(body, activeUserId);

    if (user) {
      const { data: createdBooking, error: insertError } = await supabase
        .from('bookings')
        .insert([normalizedData])
        .select('*')
        .single();

      if (insertError) {
        console.error('[API /api/bookings POST] Database insert error:', insertError.message);
        return NextResponse.json({
          success: false,
          error: {
            code: 'DATABASE_INSERT_ERROR',
            message: insertError.message || 'Failed to save booking to database.'
          }
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        booking: createdBooking,
        message: 'Booking saved successfully.'
      }, { status: 201 });
    }

    // Demo Mode In-Memory Return
    const demoBooking = {
      id: `demo-${Date.now()}`,
      ...normalizedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      passengers: []
    };

    return NextResponse.json({
      success: true,
      booking: demoBooking,
      message: 'Booking saved in demo mode.'
    }, { status: 201 });
  } catch (err: any) {
    console.error('[API /api/bookings POST] Server exception:', err);
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Unable to save booking. Please try again.'
      }
    }, { status: 500 });
  }
}
