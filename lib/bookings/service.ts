import { Booking, AddBookingInput } from './types';
import { pnrProviderService } from '@/lib/pnr/provider';
import { searchLocalTrains } from '@/lib/trains-db';

export function validatePNRFormat(pnr: string): boolean {
  return /^\d{10}$/.test(pnr.trim());
}

export function categorizeBooking(booking: Booking): 'upcoming' | 'active' | 'completed' | 'cancelled' {
  if (booking.booking_status.toUpperCase() === 'CANCELLED') {
    return 'cancelled';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let jDate: Date | null = null;
  if (booking.journey_date) {
    // Expected YYYY-MM-DD or DD-MM-YYYY
    const parts = booking.journey_date.split(/[-/.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        jDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else if (parts[2].length === 4) {
        jDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
  }

  if (!jDate || isNaN(jDate.getTime())) {
    return 'upcoming';
  }

  const diffMs = jDate.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays === 0) {
    return 'active';
  } else if (diffDays > 0) {
    return 'upcoming';
  } else {
    return 'completed';
  }
}

export function normalizeAddBooking(input: AddBookingInput, userId: string): Partial<Booking> {
  const pnr = input.pnr.trim();
  const trainNo = (input.trainNumber || '').trim();

  // Try to enrich from local DB if train number exists
  let trainName = input.trainName || '';
  let fromCode = input.fromStationCode || '';
  let fromName = input.fromStationName || '';
  let toCode = input.toStationCode || '';
  let toName = input.toStationName || '';

  if (trainNo) {
    const localMatch = searchLocalTrains(trainNo).find((t) => t.number === trainNo);
    if (localMatch) {
      if (!trainName) trainName = localMatch.name;
      if (!fromCode) fromCode = localMatch.fromCode;
      if (!fromName) fromName = localMatch.from;
      if (!toCode) toCode = localMatch.toCode;
      if (!toName) toName = localMatch.to;
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return {
    user_id: userId,
    pnr,
    train_number: trainNo || '12952',
    train_name: trainName || `Express Train #${trainNo || '12952'}`,
    from_station_code: fromCode || 'NDLS',
    from_station_name: fromName || 'New Delhi',
    to_station_code: toCode || 'MMCT',
    to_station_name: toName || 'Mumbai Central',
    journey_date: input.journeyDate || todayStr,
    departure_time: input.departureTime || '16:55',
    arrival_time: input.arrivalTime || '08:35',
    class_code: input.classCode || '2A',
    booking_status: 'CONFIRMED',
    boarding_station_code: input.boardingStationCode || fromCode || 'NDLS',
    boarding_station_name: input.boardingStationName || fromName || 'New Delhi',
  };
}
