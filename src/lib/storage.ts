"use client";

import {
  User,
  Car,
  Booking,
  Review,
  Dispute,
  Announcement,
  SessionData,
  CheckoutDraft,
} from "@/types";
import {
  SEED_USERS,
  SEED_CARS,
  SEED_BOOKINGS,
  SEED_REVIEWS,
  SEED_DISPUTES,
  SEED_ANNOUNCEMENTS,
} from "./seedData";
import { setSessionCookie, clearSessionCookie } from "./cookies";

export const STORAGE_KEYS = {
  USERS: "sw_users_v1",
  CARS: "sw_cars_v1",
  BOOKINGS: "sw_bookings_v1",
  REVIEWS: "sw_reviews_v1",
  DISPUTES: "sw_disputes_v1",
  ANNOUNCEMENTS: "sw_announcements_v1",
  SESSION: "sw_session_v1",
  CHECKOUT_DRAFT: "sw_checkout_draft_v1",
} as const;

export const STORAGE_CHANGE_EVENT = "sw_storage_update";

// Check if running on browser client
export const isBrowser = (): boolean => typeof window !== "undefined";

// Safely read from localStorage or sessionStorage
export function readStorage<T>(key: string, isSession = false, fallback: T | null = null): T | null {
  if (!isBrowser()) return fallback;
  try {
    const storage = isSession ? window.sessionStorage : window.localStorage;
    const item = storage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[SheggarWheels] Error reading storage key "${key}":`, error);
    return fallback;
  }
}

// Safely write to localStorage or sessionStorage
export function writeStorage<T>(key: string, value: T, isSession = false): boolean {
  if (!isBrowser()) return false;
  try {
    const storage = isSession ? window.sessionStorage : window.localStorage;
    storage.setItem(key, JSON.stringify(value));
    // Dispatch custom event to notify reactive hooks
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key, isSession } }));
    return true;
  } catch (error) {
    console.error(`[SheggarWheels] Error writing to storage key "${key}" (quota or permission issue):`, error);
    return false;
  }
}

// Fast in-memory cache guard to eliminate redundant localStorage reads during hydration
let isInitializedMemory = false;

// Initialize demo data if not already present
export function initializeDemoData(force = false): void {
  if (!isBrowser()) return;
  if (!force && isInitializedMemory) return;

  const storage = window.localStorage;
  const isMarked = storage.getItem("sw_initialized_v1");
  if (!force && isMarked === "true") {
    isInitializedMemory = true;
    return;
  }

  // Populate missing keys directly without triggering event storms
  if (force || !storage.getItem(STORAGE_KEYS.USERS)) {
    storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }
  if (force || !storage.getItem(STORAGE_KEYS.CARS)) {
    storage.setItem(STORAGE_KEYS.CARS, JSON.stringify(SEED_CARS));
  }
  if (force || !storage.getItem(STORAGE_KEYS.BOOKINGS)) {
    storage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
  }
  if (force || !storage.getItem(STORAGE_KEYS.REVIEWS)) {
    storage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
  }
  if (force || !storage.getItem(STORAGE_KEYS.DISPUTES)) {
    storage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(SEED_DISPUTES));
  }
  if (force || !storage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    storage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
  }

  storage.setItem("sw_initialized_v1", "true");
  isInitializedMemory = true;
}

// Reset all demo data to clean seed baseline
export function resetDemoData(): void {
  if (!isBrowser()) return;
  writeStorage(STORAGE_KEYS.USERS, SEED_USERS);
  writeStorage(STORAGE_KEYS.CARS, SEED_CARS);
  writeStorage(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS);
  writeStorage(STORAGE_KEYS.REVIEWS, SEED_REVIEWS);
  writeStorage(STORAGE_KEYS.DISPUTES, SEED_DISPUTES);
  writeStorage(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
  window.sessionStorage.removeItem(STORAGE_KEYS.CHECKOUT_DRAFT);
}

// Session Helpers
export function getCurrentSession(): SessionData | null {
  return readStorage<SessionData>(STORAGE_KEYS.SESSION, true);
}

export function saveSession(session: SessionData): void {
  writeStorage(STORAGE_KEYS.SESSION, session, true);
  setSessionCookie({
    id: session.user.id,
    email: session.user.email,
    role: session.activeRole,
    status: session.user.status,
  });
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  clearSessionCookie();
  window.dispatchEvent(
    new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key: STORAGE_KEYS.SESSION, isSession: true } })
  );
}

export function getCheckoutDraft(): CheckoutDraft | null {
  return readStorage<CheckoutDraft>(STORAGE_KEYS.CHECKOUT_DRAFT, true);
}

export function saveCheckoutDraft(draft: CheckoutDraft): void {
  writeStorage(STORAGE_KEYS.CHECKOUT_DRAFT, draft, true);
}

export function clearCheckoutDraft(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(STORAGE_KEYS.CHECKOUT_DRAFT);
  window.dispatchEvent(
    new CustomEvent(STORAGE_CHANGE_EVENT, {
      detail: { key: STORAGE_KEYS.CHECKOUT_DRAFT, isSession: true },
    })
  );
}
