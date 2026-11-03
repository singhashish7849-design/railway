import { NextRequest, NextResponse } from 'next/server';
import { SeatProviderFactory } from '@/providers/SeatProviderFactory';
import { ApiResponse } from '@/types/api';
import { SeatAvailabilityResponse, Seat } from '@/types/seat';
import { TRAINS_DB } from '@/lib/trains-db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trainNumber = searchParams.get('trainNumber');
  const journeyDate = searchParams.get('date'); // e.g. 2026-08-08
  const simulateFail = searchParams.get('simulateFail') || undefined; // e.g. "primary" | "all"

  let classCode = searchParams.get('classCode') || undefined;
  let coachNumber = searchParams.get('coachNumber') || undefined;

  // 1. Validate inputs
  if (!trainNumber) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Train number is required', timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }

  if (!journeyDate) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Journey date is required (?date=YYYY-MM-DD)', timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }

  // Find train name
  const trainInfo = TRAINS_DB.find((t) => t.number === trainNumber);
  const trainName = trainInfo ? trainInfo.name : `Express Train #${trainNumber}`;

  try {
    // 2. Fetch classes available for this train
    const classesResult = await SeatProviderFactory.getTrainClasses(trainNumber, journeyDate, simulateFail);
    const availableClasses = classesResult.data;
    const providerUsed = classesResult.providerUsed;

    if (availableClasses.length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: `Seat layout unavailable. We couldn't retrieve the verified coach configuration for train #${trainNumber}.`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Default classCode to first available if not provided
    if (!classCode) {
      classCode = availableClasses[0].code;
    }

    // 3. Fetch coaches for selected class
    const coachesResult = await SeatProviderFactory.getCoaches(trainNumber, journeyDate, classCode, simulateFail);
    const coaches = coachesResult.data;

    if (coaches.length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: `No coaches found for class ${classCode} on train #${trainNumber}.`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Default coachNumber to first available if not provided
    if (!coachNumber) {
      coachNumber = coaches[0].number;
    }

    // Double check that requested coach is in the list
    if (!coaches.some((c) => c.number === coachNumber)) {
      coachNumber = coaches[0].number;
    }

    // 4. Fetch layout and availability
    const [layoutResult, availabilityResult] = await Promise.all([
      SeatProviderFactory.getCoachLayout(trainNumber, coachNumber!, classCode, journeyDate, simulateFail),
      SeatProviderFactory.getSeatAvailability(trainNumber, coachNumber!, classCode, journeyDate, simulateFail),
    ]);

    const layout = layoutResult.data;
    const availability = availabilityResult.data;

    // 5. Map availability status back to the seats in layout
    const availabilityMap = new Map(availability.map((a) => [a.berthNumber, a.status]));
    const seatsWithStatus: Seat[] = layout.seats.map((seat) => {
      const status = availabilityMap.get(parseInt(seat.number)) || 'UNKNOWN';
      return {
        ...seat,
        status,
      };
    });

    const responseData = {
      train: {
        number: trainNumber,
        name: trainName,
      },
      journeyDate,
      coach: {
        number: coachNumber!,
        classCode,
      },
      seats: seatsWithStatus,
      source: {
        provider: providerUsed,
        fetchedAt: new Date().toISOString(), // Actual fetched time
      },
      availableClasses,
      coaches,
      layout: {
        rows: layout.rows,
        columns: layout.columns,
      },
    };

    return NextResponse.json<ApiResponse<typeof responseData>>({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: err.message || 'Seat availability unavailable.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
