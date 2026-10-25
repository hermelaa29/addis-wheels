import { create } from "zustand";
import { SessionData, UserRole } from "@/types";
import { getCurrentSession, clearSession as clearStorageSession, saveSession as saveStorageSession } from "./storage";
import { setSessionCookie, clearSessionCookie } from "./cookies";

/**
 * Zustand Auth Store
 * Manages global authentication state, active persona role, and syncs with cookies for Next.js Middleware.
 */
interface AuthState {
  session: SessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: SessionData | null) => void;
  signIn: (session: SessionData) => void;
  signOut: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) => {
    if (session) {
      saveStorageSession(session);
      setSessionCookie({
        id: session.user.id,
        email: session.user.email,
        role: session.activeRole,
        status: session.user.status,
      });
      set({ session, isAuthenticated: true, isLoading: false });
    } else {
      clearStorageSession();
      clearSessionCookie();
      set({ session: null, isAuthenticated: false, isLoading: false });
    }
  },

  signIn: (session) => {
    saveStorageSession(session);
    setSessionCookie({
      id: session.user.id,
      email: session.user.email,
      role: session.activeRole,
      status: session.user.status,
    });
    set({ session, isAuthenticated: true, isLoading: false });
  },

  signOut: () => {
    clearStorageSession();
    clearSessionCookie();
    set({ session: null, isAuthenticated: false, isLoading: false });
  },

  initialize: () => {
    const session = getCurrentSession();
    if (session) {
      setSessionCookie({
        id: session.user.id,
        email: session.user.email,
        role: session.activeRole,
        status: session.user.status,
      });
      set({ session, isAuthenticated: true, isLoading: false });
    } else {
      set({ session: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

/**
 * Zustand Filter Store
 * Manages vehicle search, debounced input, category filters, and pagination.
 */
export interface FilterState {
  searchQuery: string;
  debouncedQuery: string;
  neighbourhood: string;
  transmission: string;
  minPrice: number;
  maxPrice: number;
  seats: string;
  sortBy: "price_asc" | "price_desc" | "newest" | "popularity";
  page: number;

  setSearchQuery: (q: string) => void;
  setDebouncedQuery: (q: string) => void;
  setNeighbourhood: (n: string) => void;
  setTransmission: (t: string) => void;
  setPriceRange: (min: number, max: number) => void;
  setSeats: (s: string) => void;
  setSortBy: (sort: "price_asc" | "price_desc" | "newest" | "popularity") => void;
  setPage: (p: number) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: "",
  debouncedQuery: "",
  neighbourhood: "all",
  transmission: "all",
  minPrice: 500,
  maxPrice: 35000,
  seats: "all",
  sortBy: "popularity",
  page: 1,

  setSearchQuery: (searchQuery) => set({ searchQuery, page: 1 }),
  setDebouncedQuery: (debouncedQuery) => set({ debouncedQuery, page: 1 }),
  setNeighbourhood: (neighbourhood) => set({ neighbourhood, page: 1 }),
  setTransmission: (transmission) => set({ transmission, page: 1 }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice, page: 1 }),
  setSeats: (seats) => set({ seats, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({
      searchQuery: "",
      debouncedQuery: "",
      neighbourhood: "all",
      transmission: "all",
      minPrice: 500,
      maxPrice: 35000,
      seats: "all",
      sortBy: "popularity",
      page: 1,
    }),
}));

/**
 * Zustand Notification / Toast Store
 */
export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = "toast_" + Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
