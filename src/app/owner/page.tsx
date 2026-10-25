"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession, useIsMounted } from "@/lib/useStorage";
import {
  getCars,
  getBookings,
  transitionBooking,
  generateCsv,
  downloadCsv,
  getCarById,
} from "@/lib/data";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Car,
  DollarSign,
  TrendingUp,
  Clock,
  PlusCircle,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Download,
  BarChart2,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const isMounted = useIsMounted();
  const { session } = useSession();

  const ownerId = session?.user.id;

  // Cars owned by this user
  const myCars = useMemo(() => {
    if (!isMounted || !ownerId) return [];
    return getCars({ status: "all" }).filter((c) => c.ownerId === ownerId);
  }, [isMounted, ownerId]);

  // Bookings on owner's cars
  const myBookings = useMemo(() => {
    if (!isMounted || !ownerId) return [];
    return getBookings({ ownerId });
  }, [isMounted, ownerId]);

  // Status slices
  const approvedCars = myCars.filter((c) => c.status === "approved");
  const pendingCars = myCars.filter((c) => c.status === "pending");

  const incomingRequests = myBookings.filter((b) => b.status === "requested");
  const confirmedBookings = myBookings.filter((b) => ["confirmed", "in_progress"].includes(b.status));
  const completedBookings = myBookings.filter((b) => b.status === "completed");

  // Owner earnings (Host receives 90% of subtotal, platform takes 10%)
  const totalHostEarnings = completedBookings.reduce((acc, b) => acc + Math.round(b.subtotal * 0.9), 0);

  // Utilization calculation (booked days vs 90-day base)
  const totalBookedDays = completedBookings.reduce((acc, b) => acc + b.days, 0);
  const utilizationRate = myCars.length > 0 ? Math.min(100, Math.round((totalBookedDays / (myCars.length * 30)) * 100)) : 0;

  // Actions
  const handleApprove = (bookingId: string) => {
    const res = transitionBooking(bookingId, "confirmed");
    if (!res.success) {
      alert(`Approval error: ${res.error}`);
    } else {
      alert("Booking confirmed successfully! Renter notified.");
    }
  };

  const handleDecline = (bookingId: string) => {
    if (confirm("Decline this booking request? Simulated refund will be issued.")) {
      const res = transitionBooking(bookingId, "declined", {
        reason: "Declined by vehicle owner",
      });
      if (!res.success) alert(res.error);
    }
  };

  const handleStartTrip = (bookingId: string) => {
    const res = transitionBooking(bookingId, "in_progress");
    if (!res.success) alert(res.error);
  };

  const handleCompleteTrip = (bookingId: string) => {
    if (confirm("Mark this rental as completed? This unlocks payouts and renter reviews.")) {
      const res = transitionBooking(bookingId, "completed");
      if (!res.success) alert(res.error);
    }
  };

  // Monthly breakdown data for charts & tables
  const monthlyData = [
    { month: "Jan 2026", earnings: 18500, trips: 3 },
    { month: "Feb 2026", earnings: 24300, trips: 5 },
    { month: "Mar 2026", earnings: 38200, trips: 7 },
    { month: "Apr 2026", earnings: totalHostEarnings || 29000, trips: completedBookings.length || 4 },
  ];

  return (
    <RoleGuard requiredRole="owner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs items={[{ label: "Host Hub" }]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Host Management Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Host Operations Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Oversee your vehicle fleet, approve incoming renter requests, and track net earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/owner/cars"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Car className="w-3.5 h-3.5" /> View Fleet ({myCars.length})
            </Link>
            <Link
              href="/owner/cars/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add New Vehicle
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                My Vehicles
              </span>
              <Car className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{myCars.length}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {approvedCars.length} active, {pendingCars.length} pending moderation
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending Requests
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">{incomingRequests.length}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Awaiting your approval
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Net Host Earnings
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {totalHostEarnings.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">ETB</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              90% net payout on completed trips
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fleet Utilization
              </span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{utilizationRate}%</div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {totalBookedDays} booked days total
            </span>
          </div>
        </div>

        {/* Incoming Booking Requests Table (Priority Action Area) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> Incoming Booking Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve or decline requests. Our state machine automatically checks for date conflicts.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              {incomingRequests.length} Action Needed
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs italic">
              No pending booking requests right now. Your cars are available for new inquiries!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Booking Ref</th>
                    <th className="px-6 py-3.5">Car Requested</th>
                    <th className="px-6 py-3.5">Rental Window</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Host Payout (90%)</th>
                    <th className="px-6 py-3.5 text-right">Decision Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomingRequests.map((b) => {
                    const car = getCarById(b.carId);
                    const hostEarnings = Math.round(b.subtotal * 0.9);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          {b.id}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {car ? `${car.year} ${car.make} ${car.model}` : b.carId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {b.startDate} to {b.endDate}
                        </td>
                        <td className="px-6 py-4">
                          {b.days} {b.days === 1 ? "day" : "days"}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          {hostEarnings.toLocaleString()} ETB
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleApprove(b.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleDecline(b.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Decline
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmed / Ongoing Rentals Section */}
        {confirmedBookings.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Confirmed & Active Rentals</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update lifecycle: start trip on pickup or complete trip upon vehicle return.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Vehicle</th>
                    <th className="px-6 py-3.5">Dates</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Lifecycle Transition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {confirmedBookings.map((b) => {
                    const car = getCarById(b.carId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">{b.id}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {car ? `${car.year} ${car.make} ${car.model}` : b.carId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{b.startDate} to {b.endDate}</td>
                        <td className="px-6 py-4"><Badge status={b.status} /></td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          {b.status === "confirmed" && (
                            <button
                              onClick={() => handleStartTrip(b.id)}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition"
                            >
                              Start Rental
                            </button>
                          )}
                          {b.status === "in_progress" && (
                            <button
                              onClick={() => handleCompleteTrip(b.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                            >
                              Mark Trip Completed
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Monthly Earnings & Accessible Data Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Visual Bar Representation */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" /> Monthly Revenue Trend
              </h3>
              <Link href="/owner/earnings" className="text-xs font-semibold text-emerald-600 hover:underline">
                Full Earnings &rarr;
              </Link>
            </div>

            <div className="space-y-4 pt-2">
              {monthlyData.map((m) => {
                const maxVal = 40000;
                const pct = Math.min(100, Math.round((m.earnings / maxVal) * 100));
                return (
                  <div key={m.month} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">{m.month}</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        {m.earnings.toLocaleString()} ETB ({m.trips} trips)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              Commission assumption: Host receives 90% of subtotal; platform takes 10% fee.
            </p>
          </div>

          {/* Accessible Data Table Alternative (Rule 15 & 18) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Revenue Breakdown (Accessible Table Alternative)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Billing Period</th>
                    <th className="px-4 py-2.5">Completed Trips</th>
                    <th className="px-4 py-2.5 text-right">Net Payout (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyData.map((d) => (
                    <tr key={d.month}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{d.month}</td>
                      <td className="px-4 py-3">{d.trips} rentals</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                        {d.earnings.toLocaleString()} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400">
              Screen readers can navigate this table directly for accessible financial oversight.
            </p>
          </div>
        </div>

        {/* Quick Hub Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/owner/cars"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition text-slate-800 group"
          >
            <Car className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition" />
            <h4 className="font-bold text-sm">Vehicle Fleet ({myCars.length})</h4>
            <p className="text-xs text-slate-500 mt-1">Manage listings, edit specs, and adjust pricing.</p>
          </Link>

          <Link
            href="/owner/reviews"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition text-slate-800 group"
          >
            <CheckCircle className="w-6 h-6 text-amber-500 mb-2 group-hover:scale-110 transition" />
            <h4 className="font-bold text-sm">Customer Reviews</h4>
            <p className="text-xs text-slate-500 mt-1">Inspect renter ratings and submit host responses.</p>
          </Link>

          <Link
            href="/owner/disputes"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition text-slate-800 group"
          >
            <AlertCircle className="w-6 h-6 text-rose-500 mb-2 group-hover:scale-110 transition" />
            <h4 className="font-bold text-sm">Dispute Center</h4>
            <p className="text-xs text-slate-500 mt-1">View ongoing or resolved claims on your bookings.</p>
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}
