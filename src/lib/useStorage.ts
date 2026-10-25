"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCurrentSession,
  readStorage,
  STORAGE_KEYS,
  STORAGE_CHANGE_EVENT,
  isBrowser,
  initializeDemoData,
} from "./storage";
import { SessionData, User, Car, Booking, Review, Dispute, Announcement } from "@/types";

import { useAuthStore } from "./store";

export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Defer storage check & auth cookie sync to idle time so main thread is not blocked
    if (typeof window !== "undefined") {
      const scheduleInit = () => {
        initializeDemoData();
        useAuthStore.getState().initialize();
      };
      if ("requestIdleCallback" in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(scheduleInit);
      } else {
        setTimeout(scheduleInit, 20);
      }
    }
  }, []);
  return mounted;
}

export function useSession(): {
  session: SessionData | null;
  loading: boolean;
  refreshSession: () => void;
} {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  const sync = useCallback(() => {
    setSession(getCurrentSession());
    setLoading(false);
  }, []);

  useEffect(() => {
    sync();

    const handleUpdate = () => {
      sync();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [sync]);

  return { session, loading, refreshSession: sync };
}

export function useLiveStorage<T>(key: string, isSession = false, fallback: T | null = null): {
  data: T | null;
  refresh: () => void;
} {
  const [data, setData] = useState<T | null>(fallback);

  const sync = useCallback(() => {
    const val = readStorage<T>(key, isSession, fallback);
    setData(val);
  }, [key, isSession, fallback]);

  useEffect(() => {
    sync();

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ key?: string }>;
      if (!custom.detail || !custom.detail.key || custom.detail.key === key) {
        sync();
      }
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", sync);
    };
  }, [key, sync]);

  return { data, refresh: sync };
}
