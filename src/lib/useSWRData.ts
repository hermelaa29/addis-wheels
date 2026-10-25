"use client";

import useSWR, { SWRConfiguration } from "swr";
import { useState, useEffect } from "react";
import {
  readStorage,
  STORAGE_KEYS,
  STORAGE_CHANGE_EVENT,
  getCurrentSession,
} from "./storage";
import { Car, Booking, Dispute, Announcement, Review, User } from "@/types";

/**
 * Custom hook to debounce any value (e.g., search text, price filters)
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Universal SWR storage fetcher that hooks into browser storage
 */
const storageFetcher = <T>(key: string): T | null => {
  return readStorage<T>(key, false, null);
};

/**
 * SWR Hook for Fleet Cars with automatic storage event invalidation
 */
export function useCarsSWR(options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<Car[]>(
    STORAGE_KEYS.CARS,
    () => readStorage<Car[]>(STORAGE_KEYS.CARS, false, []) || [],
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      ...options,
    }
  );

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ key?: string }>;
      if (!custom.detail || !custom.detail.key || custom.detail.key === STORAGE_KEYS.CARS) {
        mutate();
      }
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [mutate]);

  return {
    cars: data || [],
    isLoading,
    isError: !!error,
    refreshCars: mutate,
  };
}

/**
 * SWR Hook for a single Car with caching
 */
export function useCarByIdSWR(carId: string) {
  const { cars, isLoading } = useCarsSWR();
  const car = cars.find((c) => c.id === carId) || null;
  return { car, isLoading };
}

/**
 * SWR Hook for Bookings with Polling support
 */
export function useBookingsSWR(options?: { pollInterval?: number }) {
  const { data, error, isLoading, mutate } = useSWR<Booking[]>(
    STORAGE_KEYS.BOOKINGS,
    () => readStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, false, []) || [],
    {
      refreshInterval: options?.pollInterval || 0, // 0 = no polling, or e.g. 3000ms
      revalidateOnFocus: true,
      dedupingInterval: 1500,
    }
  );

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ key?: string }>;
      if (!custom.detail || !custom.detail.key || custom.detail.key === STORAGE_KEYS.BOOKINGS) {
        mutate();
      }
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [mutate]);

  return {
    bookings: data || [],
    isLoading,
    isError: !!error,
    refreshBookings: mutate,
  };
}

/**
 * SWR Hook for Live GPS Telemetry Polling
 * Simulates a vehicle in transit across Addis Ababa coordinates at intervals
 */
export function useLiveTelemetrySWR(bookingId: string, isTrackingActive: boolean = true) {
  // Addis Ababa landmark path (Bole Airport -> Meskel Square -> Kazanchis -> Piassa -> Bole)
  const waypoints = [
    { lat: 8.9835, lng: 38.7942, label: "Bole International Airport (Origin)" },
    { lat: 9.0084, lng: 38.7675, label: "Meskel Square / Stadium" },
    { lat: 9.0182, lng: 38.7758, label: "Kazanchis Commercial Hub" },
    { lat: 9.0345, lng: 38.7523, label: "Piassa Historic Quarter" },
    { lat: 9.0227, lng: 38.7644, label: "Arat Kilo" },
  ];

  const [stepIndex, setStepIndex] = useState(0);

  // Polls every 3.5 seconds when active
  const { data: telemetry, mutate } = useSWR(
    isTrackingActive ? `telemetry_${bookingId}` : null,
    async () => {
      const point = waypoints[stepIndex % waypoints.length];
      return {
        latitude: point.lat,
        longitude: point.lng,
        locationName: point.label,
        speedKmh: Math.floor(35 + Math.random() * 25),
        batteryFuelPercent: Math.max(20, 85 - (stepIndex % 15) * 3),
        lastPing: new Date().toLocaleTimeString(),
        step: stepIndex,
      };
    },
    {
      refreshInterval: isTrackingActive ? 3500 : 0,
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    if (!isTrackingActive) return;
    const interval = setInterval(() => {
      setStepIndex((prev) => prev + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, [isTrackingActive]);

  return {
    telemetry,
    refreshTelemetry: mutate,
  };
}

/**
 * SWR Hook for Disputes with caching & revalidation
 */
export function useDisputesSWR() {
  const { data, isLoading, mutate } = useSWR<Dispute[]>(
    STORAGE_KEYS.DISPUTES,
    () => readStorage<Dispute[]>(STORAGE_KEYS.DISPUTES, false, []) || [],
    { revalidateOnFocus: true }
  );

  useEffect(() => {
    const handleUpdate = () => mutate();
    window.addEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
  }, [mutate]);

  return { disputes: data || [], isLoading, refreshDisputes: mutate };
}

/**
 * SWR Hook for Broadcast Announcements with caching
 */
export function useAnnouncementsSWR() {
  const { data, isLoading, mutate } = useSWR<Announcement[]>(
    STORAGE_KEYS.ANNOUNCEMENTS,
    () => readStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, false, []) || [],
    { revalidateOnFocus: true }
  );

  useEffect(() => {
    const handleUpdate = () => mutate();
    window.addEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
  }, [mutate]);

  return { announcements: data || [], isLoading, refreshAnnouncements: mutate };
}
