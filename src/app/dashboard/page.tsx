"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { getBookings, getCarById, transitionBooking, generateCsv, downloadCsv } from "@/lib/data";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Calendar,
  CreditCard,
  Car,
  Clock,
  Compass,
  Download,
  AlertCircle,
  CheckCircle2,
  MapPin,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function RenterDashboardPage() {
  const isMounted = useIsMounted();
  const { session } = useSession();

  const userBookings = useMemo(() => {
    if (!isMounted || !session) return [];
    return getBookings({ renterId: session.user.id });
  }, [isMounted, session]);

  // Summaries
  const upcomingBookings = userBookings.filter((b) =>
    ["requested", "confirmed"].includes(b.status)
  );
  const activeBookings = userBookings.filter((b) => b.status === "in_progress");
  const completedBookings = userBookings.filter((b) => b.status === "completed");
  const totalSpent = completedBookings.reduce((acc, b) => acc + b.total, 0);

  const handleExportCsv = () => {
    if (userBookings.length === 0) return;
    const csv = generateCsv(userBookings, [
      { key: "id", label: "Booking ID" },
      {
        key: "car",
        label: "Vehicle",
        transform: (b) => {
          const c = getCarById(b.carId);
          return c ? `${c.year} ${c.make} ${c.model}` : b.carId;
        },
      },
      { key: "startDate", label: "Pickup Date" },
      { key: "endDate", label: "Return Date" },
      { key: "days", label: "Days" },
      { key: "total", label: "Total Amount (ETB)" },
      { key: "status", label: "Status" },
      { key: "transactionRef", label: "Transaction Ref" },
      { key: "createdAt", label: "Booked On" },
    ]);
    downloadCsv(csv, `sheggar-wheels-my-bookings-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to cancel this booking request?")) {
      const res = transitionBooking(bookingId, "cancelled", {
        reason: "Cancelled by renter from dashboard",
      });
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <RoleGuard requiredRole="renter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs items={[{ label: "Renter Dashboard" }]} />

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {session?.user.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your Addis Ababa car reservations, live tracking, and rental receipts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              disabled={userBookings.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold shadow-sm transition disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Export Bookings CSV
            </button>
            <Link
              href="/cars"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-sm transition"
            >
              <Compass className="w-3.5 h-3.5" /> Book Another Car
            </Link>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Total Trips
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{userBookings.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Lifetime reservations</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Upcoming / Pending
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{upcomingBookings.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Awaiting start date or host</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Completed Trips
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{completedBookings.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Eligible for reviews</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Total Spending
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {totalSpent.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-emerald-600">ETB</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">On completed rentals</span>
          </div>
        </div>

        {/* Active Rental Banner if any */}
        {activeBookings.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-200">
                  Rental in progress
                </span>
                <h3 className="text-lg font-black">
                  Trip #{activeBookings[0].id} is currently ongoing
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">Simulate vehicle route tracking across Addis Ababa</p>
              </div>
            </div>
            <Link
              href={`/bookings/${activeBookings[0].id}/track`}
              className="px-5 py-2.5 bg-white text-emerald-800 rounded-full font-bold text-xs shadow-md hover:bg-slate-100 transition whitespace-nowrap"
            >
              Simulate Live GPS Track &rarr;
            </Link>
          </div>
        )}

        {/* Booking History Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Booking Reservations</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full list of your rental requests and their current lifecycle statuses.
              </p>
            </div>
            <Link
              href="/bookings"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <span>View full list with filters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {userBookings.length === 0 ? (
            <div className="text-center py-16 p-6">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No reservations yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                You haven&apos;t booked any cars on Sheggar Wheels yet. Browse available listings in Addis Ababa to reserve your first ride.
              </p>
              <Link
                href="/cars"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-sm"
              >
                Explore Available Fleet
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Car & Host</th>
                    <th className="px-6 py-3.5">Rental Dates</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Total Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userBookings.slice(0, 5).map((b) => {
                    const car = getCarById(b.carId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-xs">
                            {car ? `${car.year} ${car.make} ${car.model}` : "Vehicle"}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{car?.neighbourhood || "Addis Ababa"}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-slate-800">
                            {b.startDate} to {b.endDate}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold">{b.days} {b.days === 1 ? "day" : "days"}</span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-black text-slate-900">
                            {b.total.toLocaleString()} ETB
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge status={b.status} />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Link
                            href={`/bookings/${b.id}`}
                            className="inline-block text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
                          >
                            Receipt
                          </Link>

                          {b.status === "in_progress" && (
                            <Link
                              href={`/bookings/${b.id}/track`}
                              className="inline-block text-xs font-bold text-sky-600 hover:text-sky-700 underline"
                            >
                              Track
                            </Link>
                          )}

                          {b.status === "completed" && (
                            <Link
                              href={`/bookings/${b.id}/review`}
                              className="inline-block text-xs font-bold text-amber-600 hover:text-amber-700 underline"
                            >
                              Review
                            </Link>
                          )}

                          {["requested", "confirmed"].includes(b.status) && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="inline-block text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
