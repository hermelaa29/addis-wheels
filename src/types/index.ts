export type UserRole = "renter" | "owner" | "admin";
export type UserStatus = "active" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: UserRole[];
  status: UserStatus;
  createdAt: string;
}

export type CarTransmission = "automatic" | "manual";
export type CarStatus = "approved" | "pending" | "rejected" | "inactive";

export interface Car {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  transmission: CarTransmission;
  seats: number;
  city: string;
  neighbourhood: string;
  latitude: number;
  longitude: number;
  pricePerDay: number;
  photos: string[];
  description: string;
  status: CarStatus;
  unavailableDates: string[]; // ISO YYYY-MM-DD
  createdAt: string;
}

export type BookingStatus =
  | "requested"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "in_progress"
  | "completed"
  | "disputed";

export type PaymentStatus = "simulated_paid" | "pending" | "refunded";

export interface Booking {
  id: string;
  carId: string;
  renterId: string;
  ownerId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  pricePerDay: number;
  subtotal: number;
  fee: number; // 10% platform fee
  total: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  transactionRef?: string;
  cancellationReason?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  carId: string;
  renterId: string;
  ownerId: string;
  rating: number; // 1-5
  comment: string;
  ownerReply?: string;
  createdAt: string;
}

export type DisputeStatus = "open" | "under_review" | "resolved";

export interface Dispute {
  id: string;
  bookingId: string;
  openedBy: string; // User ID
  reason: string;
  description: string;
  status: DisputeStatus;
  resolutionNotes?: string;
  resolvedBy?: string; // Admin User ID
  createdAt: string;
  resolvedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  active: boolean;
  createdAt: string;
  createdBy: string;
}

export interface SessionData {
  user: User;
  activeRole: UserRole;
  createdAt: string;
}

export interface CheckoutDraft {
  carId: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: number;
  subtotal: number;
  fee: number;
  total: number;
  createdAt: string;
}

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCars: number;
  approvedCars: number;
  pendingCars: number;
  rejectedCars: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  platformCommission: number;
  totalDisputes: number;
  openDisputes: number;
}
