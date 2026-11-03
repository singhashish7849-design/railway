export type BookingCategoryTab = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface BookingPassenger {
  id: string;
  booking_id: string;
  name: string;
  age?: number;
  gender?: string;
  coach?: string;
  berth?: string;
  berth_number?: string;
  berth_type?: string;
  booking_status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  pnr: string;
  train_number: string;
  train_name: string;
  from_station_code: string;
  from_station_name: string;
  to_station_code: string;
  to_station_name: string;
  journey_date: string;
  departure_time?: string;
  arrival_time?: string;
  class_code?: string;
  booking_status: string;
  boarding_station_code?: string;
  boarding_station_name?: string;
  created_at: string;
  updated_at: string;
  passengers?: BookingPassenger[];
}

export interface PNRResult {
  supported: boolean;
  pnr: string;
  trainNumber?: string;
  trainName?: string;
  fromCode?: string;
  fromName?: string;
  toCode?: string;
  toName?: string;
  journeyDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  classCode?: string;
  bookingStatus?: string;
  boardingCode?: string;
  boardingName?: string;
  passengers?: Partial<BookingPassenger>[];
  message?: string;
}

export interface AddBookingInput {
  pnr: string;
  trainNumber?: string;
  trainName?: string;
  fromStationCode?: string;
  fromStationName?: string;
  toStationCode?: string;
  toStationName?: string;
  journeyDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  classCode?: string;
  boardingStationCode?: string;
  boardingStationName?: string;
}
