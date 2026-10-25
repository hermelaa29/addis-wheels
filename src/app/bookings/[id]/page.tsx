"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getBookingById,
  getCarById,
  getUserById,
  transitionBooking,
  createDispute,
} from "@/lib/data";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Car,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Printer,
  ShieldAlert,
  Star,
  CheckCircle2,
  AlertCircle,
  Compass,
} from "lucide-react";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isMounted = useIsMounted();
  const { session } = useSession();

  const bookingId = params?.id as string;
  const booking = useMemo(() => (isMounted ? getBookingById(bookingId) : null), [isMounted, bookingId]);
  const car = useMemo(() => (booking ? getCarById(booking.carId) : null), [booking]);
  const host = useMemo(() => (booking ? getUserById(booking.ownerId) : null), [booking]);
  const renter = useMemo(() => (booking ? getUserById(booking.renterId) : null), [booking]);

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [actionError, setActionError] = useState("");

  if (!isMounted) return null;

  if (!booking || !car) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-1">Booking Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The requested booking record does not exist or has been removed.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Ownership security check
  const isAuthorized =
    session &&
    (booking.renterId === session.user.id ||
      booking.ownerId === session.user.id ||
      session.user.roles.includes("admin"));

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center shadow-lg">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Access Unauthorized</h2>
        <p className="text-xs text-slate-600 mb-6">
          You do not have permission to view this reservation record.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to My Dashboard
        </Link>
      </div>
    );
  }

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      const res = transitionBooking(booking.id, "cancelled", {
        reason: "Cancelled by user from booking details",
      });
      if (!res.success) setActionError(res.error || "Failed to cancel");
      else router.refresh();
    }
  };

  const handleFileDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim() || !disputeDesc.trim()) {
      alert("Please enter both a reason and explanation.");
      return;
    }
    const res = createDispute({
      bookingId: booking.id,
      reason: disputeReason,
      description: disputeDesc,
    });
    if (!res.success) {
      alert(res.error);
    } else {
      setDisputeModalOpen(false);
      alert("Dispute filed successfully. Administrator has been notified.");
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      <Breadcrumbs
        items={[
          { label: "Bookings", href: "/bookings" },
          { label: `Receipt #${booking.id}` },
        ]}
      />

      {actionError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Receipt Sheet */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Receipt Header */}
        <div className="p-6 sm:p-8 bg-navy-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge status={booking.status} size="md" />
              <span className="text-xs text-emerald-400 font-mono">
                {booking.paymentStatus === "simulated_paid" ? "Simulated Payment Complete" : booking.paymentStatus}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Booking Receipt
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Ref ID: <span className="font-mono text-white">{booking.id}</span> • Transaction:{" "}
              <span className="font-mono text-emerald-300">{booking.transactionRef || "N/A"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden self-start sm:self-auto">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy-800 hover:bg-navy-700 text-slate-200 rounded-xl text-xs font-semibold border border-navy-700 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Vehicle and Host Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Vehicle Details
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {car.year} {car.make} {car.model}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{car.neighbourhood}, Addis Ababa</span>
              </div>
              <span className="text-xs text-slate-500 block mt-0.5 capitalize">
                Transmission: {car.transmission} • {car.seats} Seats
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Host / Owner Information
              </span>
              <h3 className="text-base font-bold text-slate-900">{host?.name || "Verified Host"}</h3>
              <p className="text-xs text-slate-500 mt-1">Contact: {host?.phone || "+251 91 000 0000"}</p>
              <p className="text-xs text-slate-400">{host?.email}</p>
            </div>
          </div>

          {/* Rental Dates Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                Rental Start
              </span>
              <strong className="text-slate-900 text-sm mt-0.5 block">{booking.startDate}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                Rental Return
              </span>
              <strong className="text-slate-900 text-sm mt-0.5 block">{booking.endDate}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                Duration
              </span>
              <strong className="text-slate-900 text-sm mt-0.5 block">
                {booking.days} {booking.days === 1 ? "day" : "days"}
              </strong>
            </div>
          </div>

          {/* Itemized Price Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Payment Breakdown
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1">
                <span>
                  Daily Rental Fee ({booking.pricePerDay.toLocaleString()} ETB × {booking.days} days)
                </span>
                <span className="font-semibold text-slate-800">
                  {booking.subtotal.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Platform Service & Processing Fee (10%)</span>
                <span className="font-semibold text-slate-800">
                  {booking.fee.toLocaleString()} ETB
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                <span>Total Amount Paid (Simulated)</span>
                <span className="text-emerald-600">
                  {booking.total.toLocaleString()} ETB
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation reason if cancelled */}
          {booking.cancellationReason && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
              <strong>Cancellation Reason:</strong> {booking.cancellationReason}
            </div>
          )}

          {/* Action Row */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              {booking.status === "in_progress" && (
                <Link
                  href={`/bookings/${booking.id}/track`}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" /> Track Route Simulation
                </Link>
              )}

              {booking.status === "completed" && (
                <Link
                  href={`/bookings/${booking.id}/review`}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5" /> Rate & Review Trip
                </Link>
              )}

              {["requested", "confirmed"].includes(booking.status) && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
                >
                  Cancel Booking
                </button>
              )}

              {["in_progress", "completed"].includes(booking.status) && (
                <button
                  onClick={() => setDisputeModalOpen(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Raise Dispute / Issue
                </button>
              )}
            </div>

            <Link
              href="/bookings"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              &larr; Back to My Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Raise Booking Dispute</h3>
            <p className="text-xs text-slate-500 mb-4">
              Disputes are reviewed by Sheggar Wheels platform administrators.
            </p>

            <form onSubmit={handleFileDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Reason for Dispute
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical defect, vehicle not clean..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Detailed Explanation
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what occurred during the rental period..."
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
                >
                  Submit Dispute to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
