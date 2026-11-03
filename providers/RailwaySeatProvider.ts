import { TrainClass, Coach, CoachLayout, SeatAvailability } from '@/types/seat';

export interface RailwaySeatProvider {
  name: string;

  getTrainClasses(
    trainNumber: string,
    journeyDate: string
  ): Promise<TrainClass[]>;

  getCoaches(
    trainNumber: string,
    journeyDate: string,
    classCode: string
  ): Promise<Coach[]>;

  getCoachLayout(
    trainNumber: string,
    coachNumber: string,
    classCode: string,
    journeyDate: string
  ): Promise<CoachLayout>;

  getSeatAvailability(
    trainNumber: string,
    coachNumber: string,
    classCode: string,
    journeyDate: string
  ): Promise<SeatAvailability[]>;
}
