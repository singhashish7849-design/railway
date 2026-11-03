import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getLiveJourney } from '@/lib/railradar';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.id;
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('train_number, train_name')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const liveStatus = await getLiveJourney(booking.train_number);

    return NextResponse.json({
      success: true,
      trainNumber: booking.train_number,
      trainName: booking.train_name,
      liveStatus: liveStatus || null,
    });
  } catch (err: any) {
    console.error('[API /api/bookings/[id]/status GET] Server exception:', err);
    return NextResponse.json({
      error: 'Railway information is temporarily unavailable.',
      liveStatus: null
    }, { status: 500 });
  }
}
