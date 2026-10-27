"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { getBookings, getCarById, transitionBooking, generateCsv, downloadCsv } from "@/lib/data";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Calendar,
  Download,
  Search,
  Filter,
  Car,
  CheckCircle,
  Clock,
  ArrowRight,
  MapPin,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RenterBookingsPage() {
  const isMounted = useIsMounted();
  const { session } = useSession();

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const allBookings = useMemo(() => {
    if (!isMounted || !session) return [];
    return getBookings({ renterId: session.user.id });
  }, [isMounted, session]);

  const filteredBookings = useMemo(() => {
    return allBookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const car = getCarById(b.carId);
        const carName = car ? `${car.make} ${car.model}`.toLowerCase() : "";
        const ref = (b.transactionRef || "").toLowerCase();
        const bId = b.id.toLowerCase();
        if (!carName.includes(q) && !ref.includes(q) && !bId.includes(q)) return false;
      }
      return true;
    });
  }, [allBookings, statusFilter, searchTerm]);

  const handleExportCsv = () => {
    if (filteredBookings.length === 0) return;
    const csv = generateCsv(filteredBookings, [
      { key: "id", label: "Booking ID" },
      {
        key: "car",
        label: "Vehicle",
        transform: (b) => {
          const c = getCarById(b.carId);
          return c ? `${c.year} ${c.make} ${c.model}` : b.carId;
        },
      },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "days", label: "Days" },
      { key: "subtotal", label: "Subtotal (ETB)" },
      { key: "fee", label: "Platform Fee (ETB)" },
      { key: "total", label: "Total Paid (ETB)" },
      { key: "status", label: "Status" },
      { key: "transactionRef", label: "Transaction Ref" },
      { key: "createdAt", label: "Booked On" },
    ]);
    downloadCsv(csv, `sheggar-wheels-bookings-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm("Are you sure you wish to cancel this booking?")) {
      const res = transitionBooking(bookingId, "cancelled", {
        reason: "Cancelled by renter",
      });
      if (!res.success) alert(res.error);
    }
  };

  return (
    <RoleGuard requiredRole="renter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "My Bookings" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Rental Bookings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              View and manage all historical and current car bookings in Addis Ababa.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={filteredBookings.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" /> Export Filtered CSV
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search car, ID, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="h-9 w-full sm:w-48 bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses ({allBookings.length})</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 p-6">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No Bookings Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                No reservations matched your current filter criteria.
              </p>
              <Link
                href="/cars"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
              >
                Find Cars to Book
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Reference & Date</th>
                    <th className="px-6 py-3.5">Vehicle</th>
                    <th className="px-6 py-3.5">Rental Duration</th>
                    <th className="px-6 py-3.5">Pricing</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => {
                    const car = getCarById(b.carId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-slate-800 block">
                            {b.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {b.transactionRef || "N/A"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">
                            {car ? `${car.year} ${car.make} ${car.model}` : "Vehicle"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {car?.neighbourhood || "Addis Ababa"}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-slate-800 block">
                            {b.startDate} to {b.endDate}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {b.days} {b.days === 1 ? "day" : "days"}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900 block">
                            {b.total.toLocaleString()} ETB
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (incl. 10% fee)
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge status={b.status} />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Link
                            href={`/bookings/${b.id}`}
                            className="inline-block text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                          >
                            Details & Receipt
                          </Link>

                          {b.status === "in_progress" && (
                            <Link
                              href={`/bookings/${b.id}/track`}
                              className="inline-block text-xs font-semibold text-sky-600 hover:text-sky-700 underline"
                            >
                              Track
                            </Link>
                          )}

                          {b.status === "completed" && (
                            <Link
                              href={`/bookings/${b.id}/review`}
                              className="inline-block text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
                            >
                              Review
                            </Link>
                          )}

                          {["requested", "confirmed"].includes(b.status) && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="inline-block text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
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
