"use client";

import {
  User,
  Car,
  Booking,
  Review,
  Dispute,
  Announcement,
  SessionData,
  UserRole,
  CarStatus,
  BookingStatus,
  PlatformMetrics,
} from "@/types";
import {
  readStorage,
  writeStorage,
  getCurrentSession,
  saveSession,
  clearSession,
  STORAGE_KEYS,
  isBrowser,
  initializeDemoData,
} from "./storage";
import { SEED_CARS, SEED_BOOKINGS } from "./seedData";
import {
  findCarByIdOrSlug,
  findBookingByIdOrSlug,
  getCarSlug,
  getBookingSlug,
} from "./slugs";

export { getCarSlug, getBookingSlug };

// ==========================================
// Safe URL & Return Path Validation
// ==========================================
export function safeReturnPath(path: string | null | undefined, fallback = "/"): string {
  if (!path) return fallback;
  const trimmed = path.trim();
  // Reject protocol-relative URLs (//evil.com)
  if (trimmed.startsWith("//")) return fallback;
  // Reject external protocols (http:, https:, javascript:, data:, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return fallback;
  // Reject anything that doesn't start with a single "/"
  if (!trimmed.startsWith("/") || trimmed.startsWith("/\\")) return fallback;
  return trimmed;
}

// ==========================================
// Authentication & Authorization Domain Helpers
// ==========================================
export function hasRole(session: SessionData | null, role: UserRole): boolean {
  if (!session || !session.user) return false;
  if (session.user.status === "suspended") return false;
  return session.user.roles.includes(role);
}

export function requireRole(role: UserRole): { authorized: boolean; reason?: string } {
  const session = getCurrentSession();
  if (!session) {
    return { authorized: false, reason: "Sign in required" };
  }
  if (session.user.status === "suspended") {
    return { authorized: false, reason: "Account is suspended" };
  }
  if (!session.user.roles.includes(role)) {
    return { authorized: false, reason: `Role ${role} required` };
  }
  return { authorized: true };
}

export function signInAsDemo(userId: string, targetRole?: UserRole): { success: boolean; error?: string } {
  initializeDemoData();
  const users = getUsers();
  const targetUser = users.find((u) => u.id === userId);
  if (!targetUser) {
    return { success: false, error: "Demo user not found" };
  }
  if (targetUser.status === "suspended") {
    return { success: false, error: "This demo account is suspended and cannot sign in" };
  }

  const roleToSet: UserRole = targetRole && targetUser.roles.includes(targetRole)
    ? targetRole
    : targetUser.roles[0];

  const session: SessionData = {
    user: targetUser,
    activeRole: roleToSet,
    createdAt: new Date().toISOString(),
  };
  saveSession(session);
  return { success: true };
}

export function signOut(): void {
  clearSession();
}

export function registerRenter(data: {
  name: string;
  email: string;
  phone: string;
}): { success: boolean; user?: User; error?: string } {
  initializeDemoData();
  const users = getUsers();

  if (!data.name.trim()) return { success: false, error: "Name is required" };
  if (!data.email.trim() || !data.email.includes("@")) return { success: false, error: "Valid email is required" };
  if (!data.phone.trim()) return { success: false, error: "Phone number is required" };

  // Check unique email
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase().trim());
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  // Security rule: Public registration ONLY creates renter role, never owner or admin
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    roles: ["renter"],
    status: "active",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeStorage(STORAGE_KEYS.USERS, users);

  // Sign in as new user
  saveSession({
    user: newUser,
    activeRole: "renter",
    createdAt: new Date().toISOString(),
  });

  return { success: true, user: newUser };
}

// ==========================================
// Users Management
// ==========================================
export function getUsers(): User[] {
  if (!isBrowser()) return [];
  initializeDemoData();
  return readStorage<User[]>(STORAGE_KEYS.USERS) || [];
}

export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

export function updateUserStatus(
  userId: string,
  newStatus: "active" | "suspended"
): { success: boolean; error?: string } {
  const session = getCurrentSession();
  if (!session || !hasRole(session, "admin")) {
    return { success: false, error: "Unauthorized: Administrator access required" };
  }
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: "User not found" };

  // Admin cannot suspend own account
  if (session.user.id === userId && newStatus === "suspended") {
    return { success: false, error: "Administrators cannot suspend their own account" };
  }

  users[index].status = newStatus;
  writeStorage(STORAGE_KEYS.USERS, users);
  return { success: true };
}

// ==========================================
// Cars Management
// ==========================================
export function getCars(filters?: {
  search?: string;
  neighbourhood?: string;
  minPrice?: number;
  maxPrice?: number;
  transmission?: string;
  seats?: number;
  status?: CarStatus | "all";
}): Car[] {
  if (!isBrowser()) return [];
  initializeDemoData();
  let cars = readStorage<Car[]>(STORAGE_KEYS.CARS) || [];

  // Default to approved only unless status explicitly specified
  if (!filters?.status || filters.status !== "all") {
    const requiredStatus = filters?.status || "approved";
    cars = cars.filter((c) => c.status === requiredStatus);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    cars = cars.filter(
      (c) =>
        c.make.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.neighbourhood.toLowerCase().includes(q)
    );
  }

  if (filters?.neighbourhood && filters.neighbourhood !== "all") {
    cars = cars.filter(
      (c) => c.neighbourhood.toLowerCase() === filters.neighbourhood?.toLowerCase()
    );
  }

  if (filters?.transmission && filters.transmission !== "all") {
    cars = cars.filter((c) => c.transmission === filters.transmission);
  }

  if (filters?.seats && filters.seats > 0) {
    cars = cars.filter((c) => c.seats >= (filters.seats || 0));
  }

  if (filters?.minPrice !== undefined && filters.minPrice > 0) {
    cars = cars.filter((c) => c.pricePerDay >= (filters.minPrice || 0));
  }

  if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
    cars = cars.filter((c) => c.pricePerDay <= (filters.maxPrice || 0));
  }

  return cars;
}
 
export function getCarById(idOrSlug: string): Car | null {
  if (!idOrSlug) return null;
  const storedCars = readStorage<Car[]>(STORAGE_KEYS.CARS);
  const cars = storedCars && storedCars.length > 0 ? storedCars : SEED_CARS;
  return findCarByIdOrSlug(idOrSlug, cars);
}

export function saveCar(
  carData: Omit<Car, "id" | "createdAt" | "status" | "ownerId"> & {
    id?: string;
    ownerId?: string;
    status?: CarStatus;
  }
): { success: boolean; car?: Car; error?: string } {
  const session = getCurrentSession();
  if (!session || !hasRole(session, "owner")) {
    return { success: false, error: "Unauthorized: Owner session required" };
  }
  if (session.user.status === "suspended") {
    return { success: false, error: "Suspended accounts cannot perform vehicle actions" };
  }

  const cars = readStorage<Car[]>(STORAGE_KEYS.CARS) || [];

  if (carData.id) {
    // Edit existing car
    const existing = cars.find((c) => c.id === carData.id);
    if (!existing) return { success: false, error: "Car not found" };

    // Ownership check: Cannot edit another owner's car (unless admin)
    if (existing.ownerId !== session.user.id && !hasRole(session, "admin")) {
      return { success: false, error: "Forbidden: You do not own this vehicle" };
    }

    const updatedCar: Car = {
      ...existing,
      ...carData,
      ownerId: existing.ownerId, // Preserve true owner
      status: hasRole(session, "admin") ? (carData.status || existing.status) : "pending", // Modified listings go to moderation
    };

    const index = cars.findIndex((c) => c.id === carData.id);
    cars[index] = updatedCar;
    writeStorage(STORAGE_KEYS.CARS, cars);
    return { success: true, car: updatedCar };
  } else {
    // Create new car
    const newCar: Car = {
      ...carData,
      id: `car_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId: session.user.id,
      status: "pending", // New listings require admin moderation
      unavailableDates: carData.unavailableDates || [],
      createdAt: new Date().toISOString(),
    };
    cars.push(newCar);
    writeStorage(STORAGE_KEYS.CARS, cars);
    return { success: true, car: newCar };
  }
}

export function moderateCar(
  carId: string,
  newStatus: "approved" | "rejected"
): { success: boolean; error?: string } {
  const session = getCurrentSession();
  if (!session || !hasRole(session, "admin")) {
    return { success: false, error: "Unauthorized: Admin privileges required" };
  }
  const cars = readStorage<Car[]>(STORAGE_KEYS.CARS) || [];
  const index = cars.findIndex((c) => c.id === carId);
  if (index === -1) return { success: false, error: "Car not found" };

  cars[index].status = newStatus;
  writeStorage(STORAGE_KEYS.CARS, cars);
  return { success: true };
}

export function updateCarAvailability(
  carId: string,
  unavailableDates: string[]
): { success: boolean; error?: string } {
  const session = getCurrentSession();
  if (!session) return { success: false, error: "Authentication required" };

  const cars = readStorage<Car[]>(STORAGE_KEYS.CARS) || [];
  const index = cars.findIndex((c) => c.id === carId);
  if (index === -1) return { success: false, error: "Car not found" };

  // Ownership validation
  if (cars[index].ownerId !== session.user.id && !hasRole(session, "admin")) {
    return { success: false, error: "Forbidden: You do not own this vehicle" };
  }

  cars[index].unavailableDates = unavailableDates;
  writeStorage(STORAGE_KEYS.CARS, cars);
  return { success: true };
}

// ==========================================
// Date & Availability Calculations
// ==========================================
export function calculateDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function isDateRangeAvailable(carId: string, startDate: string, endDate: string): boolean {
  const car = getCarById(carId);
  if (!car) return false;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check owner-blocked dates
  for (const unDate of car.unavailableDates) {
    const d = new Date(unDate);
    if (d >= start && d <= end) {
      return false;
    }
  }

  // Check conflicting confirmed or in_progress bookings
  const bookings = getBookings({ carId });
  const activeBookings = bookings.filter((b) =>
    ["confirmed", "in_progress"].includes(b.status)
  );

  for (const b of activeBookings) {
    const bStart = new Date(b.startDate);
    const bEnd = new Date(b.endDate);
    // Overlap condition: start <= bEnd && end >= bStart
    if (start <= bEnd && end >= bStart) {
      return false;
    }
  }

  return true;
}

// ==========================================
// Bookings Management & State Machine
// ==========================================
export function getBookings(filters?: {
  renterId?: string;
  ownerId?: string;
  carId?: string;
  status?: BookingStatus;
}): Booking[] {
  if (!isBrowser()) return [];
  initializeDemoData();
  let bookings = readStorage<Booking[]>(STORAGE_KEYS.BOOKINGS) || [];

  if (filters?.renterId) {
    bookings = bookings.filter((b) => b.renterId === filters.renterId);
  }
  if (filters?.ownerId) {
    bookings = bookings.filter((b) => b.ownerId === filters.ownerId);
  }
  if (filters?.carId) {
    bookings = bookings.filter((b) => b.carId === filters.carId);
  }
  if (filters?.status) {
    bookings = bookings.filter((b) => b.status === filters.status);
  }

  return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBookingById(idOrSlug: string): Booking | null {
  if (!idOrSlug) return null;
  const storedBookings = readStorage<Booking[]>(STORAGE_KEYS.BOOKINGS);
  const bookings = storedBookings && storedBookings.length > 0 ? storedBookings : SEED_BOOKINGS;
  return findBookingByIdOrSlug(idOrSlug, bookings);
}

export function createBooking(data: {
  carId: string;
  startDate: string;
  endDate: string;
}): { success: boolean; booking?: Booking; error?: string } {
  const session = getCurrentSession();
  if (!session || !session.user) {
    return { success: false, error: "A signed-in renter account is required to make a booking" };
  }
  if (session.user.status === "suspended") {
    return { success: false, error: "Suspended accounts cannot create bookings" };
  }

  const car = getCarById(data.carId);
  if (!car) return { success: false, error: "Car not found" };
  if (car.status !== "approved") return { success: false, error: "This car is not available for rental" };

  if (car.ownerId === session.user.id) {
    return { success: false, error: "You cannot rent your own vehicle" };
  }

  const days = calculateDays(data.startDate, data.endDate);
  if (days <= 0) {
    return { success: false, error: "Invalid rental duration. End date must be after start date." };
  }

  if (!isDateRangeAvailable(data.carId, data.startDate, data.endDate)) {
    return { success: false, error: "Selected dates are no longer available for this car" };
  }

  const subtotal = car.pricePerDay * days;
  const fee = Math.round(subtotal * 0.1); // 10% platform fee
  const total = subtotal + fee;

  const newBooking: Booking = {
    id: `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    carId: car.id,
    renterId: session.user.id,
    ownerId: car.ownerId,
    startDate: data.startDate,
    endDate: data.endDate,
    days,
    pricePerDay: car.pricePerDay,
    subtotal,
    fee,
    total,
    paymentStatus: "simulated_paid",
    status: "requested",
    transactionRef: `SW-TXN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const bookings = readStorage<Booking[]>(STORAGE_KEYS.BOOKINGS) || [];
  bookings.push(newBooking);
  writeStorage(STORAGE_KEYS.BOOKINGS, bookings);

  return { success: true, booking: newBooking };
}

/**
 * Booking State Transitions with strict actor and transition validation:
 * - requested -> confirmed, declined, cancelled
 * - confirmed -> in_progress, cancelled
 * - in_progress -> completed, disputed
 * - completed -> eligible for review
 * - disputed -> resolved
 */
export function transitionBooking(
  bookingId: string,
  targetStatus: BookingStatus,
  options?: { reason?: string; resolutionNotes?: string }
): { success: boolean; booking?: Booking; error?: string } {
  const session = getCurrentSession();
  if (!session || !session.user) {
    return { success: false, error: "Authentication required" };
  }
  if (session.user.status === "suspended") {
    return { success: false, error: "Suspended accounts cannot modify bookings" };
  }

  const bookings = readStorage<Booking[]>(STORAGE_KEYS.BOOKINGS) || [];
  const index = bookings.findIndex((b) => b.id === bookingId);
  if (index === -1) return { success: false, error: "Booking not found" };

  const currentBooking = bookings[index];
  const isRenter = currentBooking.renterId === session.user.id;
  const isOwner = currentBooking.ownerId === session.user.id;
  const isAdmin = hasRole(session, "admin");

  // Validate state transitions
  switch (targetStatus) {
    case "confirmed": {
      // Only owner or admin can confirm
      if (!isOwner && !isAdmin) {
        return { success: false, error: "Only the vehicle owner can confirm a booking request" };
      }
      if (currentBooking.status !== "requested") {
        return { success: false, error: `Cannot confirm booking in "${currentBooking.status}" state` };
      }
      // Re-check for overlapping active bookings before confirming
      const start = new Date(currentBooking.startDate);
      const end = new Date(currentBooking.endDate);
      const overlapping = bookings.some(
        (b) =>
          b.id !== currentBooking.id &&
          b.carId === currentBooking.carId &&
          ["confirmed", "in_progress"].includes(b.status) &&
          start <= new Date(b.endDate) &&
          end >= new Date(b.startDate)
      );
      if (overlapping) {
        return {
          success: false,
          error: "Conflict detected: another booking for this vehicle is already confirmed during these dates",
        };
      }
      break;
    }

    case "declined": {
      // Only owner or admin can decline
      if (!isOwner && !isAdmin) {
        return { success: false, error: "Only the vehicle owner can decline a booking request" };
      }
      if (currentBooking.status !== "requested") {
        return { success: false, error: `Cannot decline booking in "${currentBooking.status}" state` };
      }
      break;
    }

    case "cancelled": {
      // Renter, owner, or admin can cancel if eligible
      if (!isRenter && !isOwner && !isAdmin) {
        return { success: false, error: "Forbidden: You cannot cancel another user's booking" };
      }
      if (!["requested", "confirmed"].includes(currentBooking.status)) {
        return {
          success: false,
          error: `Cannot cancel a booking that is already "${currentBooking.status}"`,
        };
      }
      break;
    }

    case "in_progress": {
      // Owner, renter, or admin can start rental
      if (!isOwner && !isRenter && !isAdmin) {
        return { success: false, error: "Unauthorized to mark rental in progress" };
      }
      if (currentBooking.status !== "confirmed") {
        return { success: false, error: `Cannot start rental from "${currentBooking.status}" status` };
      }
      break;
    }

    case "completed": {
      // Owner or admin can mark completed
      if (!isOwner && !isAdmin) {
        return { success: false, error: "Only the vehicle host can mark a trip as completed" };
      }
      if (currentBooking.status !== "in_progress") {
        return { success: false, error: `Cannot complete booking in "${currentBooking.status}" state` };
      }
      break;
    }

    case "disputed": {
      if (!isRenter && !isOwner && !isAdmin) {
        return { success: false, error: "Unauthorized to open a dispute" };
      }
      if (!["in_progress", "completed"].includes(currentBooking.status)) {
        return {
          success: false,
          error: `Disputes can only be raised for ongoing or recently completed rentals`,
        };
      }
      break;
    }

    default:
      return { success: false, error: `Unsupported transition to status "${targetStatus}"` };
  }

  // Update booking
  currentBooking.status = targetStatus;
  currentBooking.updatedAt = new Date().toISOString();
  if (options?.reason) {
    currentBooking.cancellationReason = options.reason;
  }
  if (targetStatus === "cancelled" || targetStatus === "declined") {
    currentBooking.paymentStatus = "refunded";
  }

  bookings[index] = currentBooking;
  writeStorage(STORAGE_KEYS.BOOKINGS, bookings);

  return { success: true, booking: currentBooking };
}

// ==========================================
// Reviews Management
// ==========================================
export function getReviews(carId?: string): Review[] {
  if (!isBrowser()) return [];
  initializeDemoData();
  const reviews = readStorage<Review[]>(STORAGE_KEYS.REVIEWS) || [];
  if (carId) {
    return reviews.filter((r) => r.carId === carId);
  }
  return reviews;
}

export function createReview(data: {
  bookingId: string;
  rating: number;
  comment: string;
}): { success: boolean; review?: Review; error?: string } {
  const session = getCurrentSession();
  if (!session || !session.user) {
    return { success: false, error: "Sign in required" };
  }
  if (session.user.status === "suspended") {
    return { success: false, error: "Suspended accounts cannot submit reviews" };
  }

  const booking = getBookingById(data.bookingId);
  if (!booking) return { success: false, error: "Booking not found" };

  // Only eligible renter can review
  if (booking.renterId !== session.user.id) {
    return { success: false, error: "Only the renter who completed this booking can review it" };
  }
  if (booking.status !== "completed") {
    return { success: false, error: "Only completed rentals are eligible for review" };
  }

  const reviews = readStorage<Review[]>(STORAGE_KEYS.REVIEWS) || [];
  // One review per booking
  const existingReview = reviews.find((r) => r.bookingId === data.bookingId);
  if (existingReview) {
    return { success: false, error: "A review has already been submitted for this booking" };
  }

  if (data.rating < 1 || data.rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5 stars" };
  }
  if (!data.comment.trim()) {
    return { success: false, error: "Review comment cannot be empty" };
  }

  const newReview: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bookingId: booking.id,
    carId: booking.carId,
    renterId: booking.renterId,
    ownerId: booking.ownerId,
    rating: data.rating,
    comment: data.comment.trim(),
    createdAt: new Date().toISOString(),
  };

  reviews.push(newReview);
  writeStorage(STORAGE_KEYS.REVIEWS, reviews);
  return { success: true, review: newReview };
}

export function replyToReview(
  reviewId: string,
  reply: string
): { success: boolean; error?: string } {
  const session = getCurrentSession();
  if (!session || !session.user) return { success: false, error: "Sign in required" };

  const reviews = readStorage<Review[]>(STORAGE_KEYS.REVIEWS) || [];
  const index = reviews.findIndex((r) => r.id === reviewId);
  if (index === -1) return { success: false, error: "Review not found" };

  const review = reviews[index];
  if (review.ownerId !== session.user.id && !hasRole(session, "admin")) {
    return { success: false, error: "Only the vehicle owner can reply to this review" };
  }

  reviews[index].ownerReply = reply.trim();
  writeStorage(STORAGE_KEYS.REVIEWS, reviews);
  return { success: true };
}

// ==========================================
// Disputes Management
// ==========================================
export function getDisputes(): Dispute[] {
  if (!isBrowser()) return [];
  initializeDemoData();
  return readStorage<Dispute[]>(STORAGE_KEYS.DISPUTES) || [];
}

export function createDispute(data: {
  bookingId: string;
  reason: string;
  description: string;
}): { success: boolean; dispute?: Dispute; error?: string } {
  const session = getCurrentSession();
  if (!session || !session.user) return { success: false, error: "Sign in required" };
  if (session.user.status === "suspended") {
    return { success: false, error: "Suspended accounts cannot file disputes" };
  }

  const booking = getBookingById(data.bookingId);
  if (!booking) return { success: false, error: "Booking not found" };

  if (booking.renterId !== session.user.id && booking.ownerId !== session.user.id) {
    return { success: false, error: "Forbidden: You are neither the renter nor owner of this trip" };
  }

  const newDispute: Dispute = {
    id: `dsp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bookingId: booking.id,
    openedBy: session.user.id,
    reason: data.reason.trim(),
    description: data.description.trim(),
    status: "open",
    createdAt: new Date().toISOString(),
  };

  const disputes = readStorage<Dispute[]>(STORAGE_KEYS.DISPUTES) || [];
  disputes.push(newDispute);
  writeStorage(STORAGE_KEYS.DISPUTES, disputes);

  // Transition booking status to disputed
  transitionBooking(booking.id, "disputed");

  return { success: true, dispute: newDispute };
}

export function resolveDispute(
  disputeId: string,
  resolutionNotes: string
): { success: boolean; error?: string } {
  const session = getCurrentSession();
  if (!session || !hasRole(session, "admin")) {
    return { success: false, error: "Unauthorized: Administrator privileges required to resolve disputes" };
  }

  const disputes = readStorage<Dispute[]>(STORAGE_KEYS.DISPUTES) || [];
  const index = disputes.findIndex((d) => d.id === disputeId);
  if (index === -1) return { success: false, error: "Dispute not found" };

  const dispute = disputes[index];
  if (dispute.status === "resolved") {
    return { success: false, error: "This dispute has already been resolved" };
  }

  disputes[index].status = "resolved";
  disputes[index].resolutionNotes = resolutionNotes.trim();
  disputes[index].resolvedBy = session.user.id;
  disputes[index].resolvedAt = new Date().toISOString();

  writeStorage(STORAGE_KEYS.DISPUTES, disputes);
  return { success: true };
}

// ==========================================
// Announcements Management
// ==========================================
export function getAnnouncements(activeOnly = false): Announcement[] {
  if (!isBrowser()) return [];
  initializeDemoData();
  const announcements = readStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS) || [];
  if (activeOnly) {
    return announcements.filter((a) => a.active);
  }
  return announcements;
}

export function saveAnnouncement(
  data: { id?: string; title: string; message: string; active: boolean }
): { success: boolean; error?: string } {
  const session = getCurrentSession();
  if (!session || !hasRole(session, "admin")) {
    return { success: false, error: "Unauthorized: Admin privileges required" };
  }

  const announcements = readStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS) || [];

  if (data.id) {
    const index = announcements.findIndex((a) => a.id === data.id);
    if (index === -1) return { success: false, error: "Announcement not found" };
    announcements[index] = {
      ...announcements[index],
      title: data.title.trim(),
      message: data.message.trim(),
      active: data.active,
    };
  } else {
    announcements.push({
      id: `anc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: data.title.trim(),
      message: data.message.trim(),
      active: data.active,
      createdAt: new Date().toISOString(),
      createdBy: session.user.id,
    });
  }

  writeStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
  return { success: true };
}

// ==========================================
// Platform Analytics & Metrics
// ==========================================
export function getPlatformMetrics(): PlatformMetrics {
  const users = getUsers();
  const cars = readStorage<Car[]>(STORAGE_KEYS.CARS) || [];
  const bookings = readStorage<Booking[]>(STORAGE_KEYS.BOOKINGS) || [];
  const disputes = readStorage<Dispute[]>(STORAGE_KEYS.DISPUTES) || [];

  const completed = bookings.filter((b) => b.status === "completed");
  const totalRevenue = completed.reduce((acc, b) => acc + b.total, 0);
  const platformCommission = completed.reduce((acc, b) => acc + b.fee, 0);

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    suspendedUsers: users.filter((u) => u.status === "suspended").length,
    totalCars: cars.length,
    approvedCars: cars.filter((c) => c.status === "approved").length,
    pendingCars: cars.filter((c) => c.status === "pending").length,
    rejectedCars: cars.filter((c) => c.status === "rejected").length,
    totalBookings: bookings.length,
    completedBookings: completed.length,
    totalRevenue,
    platformCommission,
    totalDisputes: disputes.length,
    openDisputes: disputes.filter((d) => d.status === "open").length,
  };
}

// ==========================================
// CSV Export with RFC 4180 Escaping
// ==========================================
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains comma, quote, or newline, escape internal quotes and wrap in quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function generateCsv<T>(
  data: T[],
  headers: { key: keyof T | string; label: string; transform?: (item: T) => unknown }[]
): string {
  const headerRow = headers.map((h) => escapeCsvCell(h.label)).join(",");
  const dataRows = data.map((item) =>
    headers
      .map((h) => {
        const val = h.transform ? h.transform(item) : (item as Record<string, unknown>)[h.key as string];
        return escapeCsvCell(val);
      })
      .join(",")
  );
  return [headerRow, ...dataRows].join("\r\n");
}

export function downloadCsv(csvContent: string, filename: string): void {
  if (!isBrowser()) return;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
