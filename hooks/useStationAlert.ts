'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Station, LiveJourney } from '@/types/train';
import { useLiveJourney } from './useLiveJourney';
import { useQuery } from '@tanstack/react-query';
import {
  calculateGeodesicDistance
} from '@/services/stationAlert/stationDistanceService';
import {
  calculateStationETA
} from '@/services/stationAlert/stationEtaService';
import {
  stationAlertService,
  isStationAheadOfTrain,
  hasTrainArrivedAtStation,
  STATION_ALERT_THRESHOLDS,
  StationAlertConfig
} from '@/services/stationAlert/stationAlertService';
import {
  stationNotificationService
} from '@/services/stationAlert/stationNotificationService';
import { useStationAlertStore } from '@/store/stationAlert';

/**
 * 1. Hook: useStationDistance
 * Computes live distance between current train position and station coordinates.
 */
export function useStationDistance(
  journey: LiveJourney | null | undefined,
  stationCode: string
): number | null {
  return useMemo(() => {
    if (!journey || !stationCode) return null;
    const station = journey.stations.find((s) => s.code === stationCode);
    if (!station) return null;

    return calculateGeodesicDistance(
      journey.currentLocation?.lat,
      journey.currentLocation?.lng,
      station.lat,
      station.lng
    );
  }, [journey, stationCode]);
}

/**
 * 2. Hook: useStationETA
 * Returns ETA text based on distance and current speed/timetable fallbacks.
 */
export function useStationETA(
  journey: LiveJourney | null | undefined,
  stationCode: string,
  distanceKm: number | null
): string {
  return useMemo(() => {
    if (!journey || !stationCode || distanceKm === null) {
      return 'ETA unavailable';
    }
    return calculateStationETA(journey, stationCode, distanceKm).text;
  }, [journey, stationCode, distanceKm]);
}

/**
 * 3. Hook: useStationRouteProgress
 * Computes journey percentage and progress statistics towards the target station.
 */
export function useStationRouteProgress(
  journey: LiveJourney | null | undefined,
  stationCode: string
) {
  return useMemo(() => {
    if (!journey || !stationCode) {
      return { percentage: 0, coveredKm: 0, remainingKm: 0 };
    }

    const station = journey.stations.find((s) => s.code === stationCode);
    if (!station) {
      return { percentage: 0, coveredKm: 0, remainingKm: 0 };
    }

    // Find first station and total distance to target
    const firstStation = journey.stations[0];
    const totalDistanceToStation = station.distanceKm - (firstStation?.distanceKm || 0);

    const currentDistanceCovered = Math.max(0, journey.distanceCoveredKm);
    const coveredKm = Math.min(totalDistanceToStation, currentDistanceCovered);
    const remainingKm = Math.max(0, totalDistanceToStation - coveredKm);
    const percentage = totalDistanceToStation > 0 
      ? Math.min(100, Math.round((coveredKm / totalDistanceToStation) * 100))
      : 0;

    return { percentage, coveredKm, remainingKm };
  }, [journey, stationCode]);
}

/**
 * 4. Hook: useStationAlertNotifications
 * Observes tracking states and handles raising threshold notifications and delay changes.
 */
export function useStationAlertNotifications(
  trainNumber: string,
  journey: LiveJourney | null | undefined,
  isEnabled: boolean,
  selectedStationCode: string,
  triggeredThresholds: number[],
  setTriggeredThresholds: (thresholds: number[]) => void
) {
  const addNotification = useStationAlertStore((state) => state.addNotification);

  // Query food orders to connect with station alerts
  const { data: pastOrdersJson } = useQuery({
    queryKey: ['pastFoodOrders'],
    queryFn: async () => {
      const res = await fetch('/api/food/orders');
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });

  const activeFoodOrder = useMemo(() => {
    return (pastOrdersJson || []).find(
      (o: any) =>
        o.trainNumber === trainNumber &&
        o.stationCode === selectedStationCode &&
        o.status !== 'DELIVERED' &&
        o.status !== 'CANCELLED' &&
        o.status !== 'FAILED'
    );
  }, [pastOrdersJson, trainNumber, selectedStationCode]);

  // Trigger alert threshold
  const triggerAlert = useCallback((threshold: number) => {
    if (!journey || !selectedStationCode) return;
    const station = journey.stations.find(s => s.code === selectedStationCode);
    if (!station) return;

    let title = '';
    let body = '';

    if (activeFoodOrder) {
      if (threshold >= 10) {
        title = `🍱 Your food order is ready at ${station.name}`;
        body = `Order #${activeFoodOrder.id} is ready for delivery. Coach: ${activeFoodOrder.coach}, Seat: ${activeFoodOrder.seat}.`;
      } else if (threshold >= 2) {
        title = `🚆 Train approaching ${station.name}`;
        body = `Your food order is ready. Get ready to receive your delivery at Coach ${activeFoodOrder.coach}, Seat ${activeFoodOrder.seat}.`;
      } else {
        title = `🍱 Food Scheduled for Delivery`;
        body = `Train has arrived at ${station.name}. Your order #${activeFoodOrder.id} is scheduled for delivery at your seat.`;
      }
    } else {
      const details = stationNotificationService.getAlertDetails(station.name, threshold);
      title = details.title;
      body = details.body;
    }

    // 1. Add In-App Toast
    addNotification({
      id: `${selectedStationCode}-${threshold}`,
      title,
      body
    });

    // 2. Trigger System Notification
    stationNotificationService.sendBrowserNotification(title, body);

    // 3. Mark threshold and all larger thresholds as triggered to prevent duplicates
    const updated = [...triggeredThresholds];
    STATION_ALERT_THRESHOLDS.forEach((t) => {
      if (t >= threshold && !updated.includes(t)) {
        updated.push(t);
      }
    });
    if (threshold === 0 && !updated.includes(0)) {
      updated.push(0);
    }

    setTriggeredThresholds(updated);

    // Save state back to localStorage
    const saved = stationAlertService.getAlert(trainNumber);
    if (saved) {
      stationAlertService.saveAlert({
        ...saved,
        triggeredThresholds: updated
      });
    }
  }, [journey, selectedStationCode, triggeredThresholds, trainNumber, addNotification, setTriggeredThresholds, activeFoodOrder]);

  // Compute live distance
  const distanceKm = useStationDistance(journey, selectedStationCode);

  // Observe distance to trigger alerts
  useEffect(() => {
    if (!isEnabled || !journey || !selectedStationCode || distanceKm === null) return;

    // Check arrival first
    const isArrived = hasTrainArrivedAtStation(journey, selectedStationCode, distanceKm);
    if (isArrived) {
      if (!triggeredThresholds.includes(0)) {
        triggerAlert(0);
      }
      return;
    }

    // Verify station is ahead. Do not notify for passed stations.
    const isAhead = isStationAheadOfTrain(journey.stations, selectedStationCode);
    if (!isAhead) return;

    // Find the lowest breached threshold
    for (const t of STATION_ALERT_THRESHOLDS) {
      if (distanceKm <= t) {
        if (!triggeredThresholds.includes(t)) {
          triggerAlert(t);
          break;
        }
      }
    }
  }, [distanceKm, isEnabled, journey, selectedStationCode, triggeredThresholds, triggerAlert]);

  // Observe delay updates
  useEffect(() => {
    if (!isEnabled || !journey || !selectedStationCode) return;
    const station = journey.stations.find((s) => s.code === selectedStationCode);
    if (!station) return;

    const saved = stationAlertService.getAlert(trainNumber);
    if (!saved) return;

    const currentDelay = station.delayMinutes;
    const previousDelay = saved.lastDelayMinutes;

    if (previousDelay !== undefined && currentDelay !== previousDelay && Math.abs(currentDelay - previousDelay) >= 2) {
      const delayText = currentDelay > 0 ? `${currentDelay} min delay` : 'on time';
      const title = '⚠️ Arrival estimate updated';
      const body = `${station.name} is now estimated with ${delayText}.`;

      addNotification({
        id: `delay-${selectedStationCode}-${Date.now()}`,
        title,
        body,
        isDelayWarning: true
      });

      stationNotificationService.sendBrowserNotification(title, body);

      stationAlertService.saveAlert({
        ...saved,
        lastDelayMinutes: currentDelay
      });
    } else if (previousDelay === undefined) {
      stationAlertService.saveAlert({
        ...saved,
        lastDelayMinutes: currentDelay
      });
    }
  }, [journey, isEnabled, selectedStationCode, trainNumber, addNotification]);
}

/**
 * 5. Hook: useStationAlert
 * Main layout hook to manage selected alerts, persistent preferences, and controls.
 */
export function useStationAlert(trainNumber: string) {
  const { data: journey } = useLiveJourney(trainNumber);
  
  const [alertConfig, setAlertConfig] = useState<StationAlertConfig | null>(null);
  const [triggeredThresholds, setTriggeredThresholds] = useState<number[]>([]);
  const [seatInfo, setSeatInfo] = useState<{ coachNumber?: string; seatNumber?: string; type?: string } | null>(null);

  // Sync state from localStorage on mount and when trainNumber updates
  useEffect(() => {
    const saved = stationAlertService.getAlert(trainNumber);
    if (saved) {
      // Check reset logic: reset triggered values if dates/trains mismatch
      if (saved.trainNumber !== trainNumber || (journey && saved.journeyDate !== new Date().toISOString().split('T')[0])) {
        stationAlertService.clearAlert(trainNumber);
        setAlertConfig(null);
        setTriggeredThresholds([]);
      } else {
        setAlertConfig(saved);
        setTriggeredThresholds(saved.triggeredThresholds || []);
      }
    } else {
      setAlertConfig(null);
      setTriggeredThresholds([]);
    }

    // Read selected seat preference if any
    const savedSeat = localStorage.getItem(`rail_selected_seat_${trainNumber}`);
    if (savedSeat) {
      try {
        setSeatInfo(JSON.parse(savedSeat));
      } catch {
        setSeatInfo(null);
      }
    } else {
      setSeatInfo(null);
    }
  }, [trainNumber, journey]);

  // Derive alert details
  const isEnabled = alertConfig?.enabled || false;
  const selectedStationCode = alertConfig?.stationCode || '';
  const selectedStationName = alertConfig?.stationName || '';

  const selectedStationObject = useMemo(() => {
    if (!journey || !selectedStationCode) return null;
    return journey.stations.find((s) => s.code === selectedStationCode) || null;
  }, [journey, selectedStationCode]);

  const distanceKm = useStationDistance(journey, selectedStationCode);
  const etaText = useStationETA(journey, selectedStationCode, distanceKm);

  // Enable an alert
  const enableAlert = useCallback((station: Station) => {
    if (!journey) return;
    
    // Read selected seat preferred info
    let activeSeat: any = null;
    const savedSeat = localStorage.getItem(`rail_selected_seat_${trainNumber}`);
    if (savedSeat) {
      try {
        activeSeat = JSON.parse(savedSeat);
      } catch {}
    }

    const config: StationAlertConfig = {
      id: `${trainNumber}-${station.code}-${Date.now()}`,
      trainNumber,
      stationCode: station.code,
      stationName: station.name,
      journeyDate: new Date().toISOString().split('T')[0],
      enabled: true,
      triggeredThresholds: [],
      lastDelayMinutes: station.delayMinutes,
      coachNumber: activeSeat?.coachNumber,
      seatNumber: activeSeat?.seatNumber,
      seatType: activeSeat?.type
    };

    stationAlertService.saveAlert(config);
    setAlertConfig(config);
    setTriggeredThresholds([]);
    if (activeSeat) setSeatInfo(activeSeat);
  }, [trainNumber, journey]);

  // Disable alert
  const disableAlert = useCallback(() => {
    stationAlertService.clearAlert(trainNumber);
    setAlertConfig(null);
    setTriggeredThresholds([]);
  }, [trainNumber]);

  // Register notification monitoring
  useStationAlertNotifications(
    trainNumber,
    journey || null,
    isEnabled,
    selectedStationCode,
    triggeredThresholds,
    setTriggeredThresholds
  );

  return {
    selectedStation: selectedStationObject,
    selectedStationName,
    selectedStationCode,
    distanceKm,
    eta: etaText,
    isEnabled,
    enableAlert,
    disableAlert,
    seatInfo,
    triggeredThresholds
  };
}
