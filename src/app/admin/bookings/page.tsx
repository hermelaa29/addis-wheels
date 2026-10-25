"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getBookings, getCarById, getUserById, generateCsv, downloadCsv } from "@/lib/data";
import { useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Calendar, Search, Download, Car, ArrowRight } from "lucide-react";

export default function AdminBookingsPage() {
  const isMounted = useIsMounted();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const allBookings = useMemo(() => {
    if (!isMounted) return [];
    return getBookings();
  }, [isMounted]);

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
      {
        key: "renter",
        label: "Renter",
        transform: (b) => {
          const u = getUserById(b.renterId);
          return u ? u.name : b.renterId;
        },
      },
      {
        key: "host",
        label: "Host",
        transform: (b) => {
          const u = getUserById(b.ownerId);
          return u ? u.name : b.ownerId;
        },
      },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "days", label: "Days" },
      { key: "subtotal", label: "Subtotal (ETB)" },
      { key: "fee", label: "Platform Commission (ETB)" },
      { key: "total", label: "Gross Total (ETB)" },
      { key: "status", label: "Status" },
      { key: "transactionRef", label: "Transaction Reference" },
      { key: "createdAt", label: "Booked On" },
    ]);
    downloadCsv(csv, `sheggar-wheels-all-bookings-${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "All Platform Bookings" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Platform Rental Bookings ({allBookings.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Audit all active, confirmed, completed, and disputed rentals across Addis Ababa.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={filteredBookings.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" /> Export Bookings CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search car, booking ID, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
            >
              <option value="all">All Statuses ({allBookings.length})</option>
              <option value="requested">Requested</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Ref & Date</th>
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Renter & Host</th>
                  <th className="px-6 py-3.5">Rental Duration</th>
                  <th className="px-6 py-3.5">Gross / Commission</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const car = getCarById(b.carId);
                  const renter = getUserById(b.renterId);
                  const host = getUserById(b.ownerId);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-900 block">{b.id}</span>
                        <span className="text-[10px] text-slate-400">{b.transactionRef || "N/A"}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 block">
                          {car ? `${car.year} ${car.make} ${car.model}` : b.carId}
                        </span>
                        <span className="text-[11px] text-slate-400">{car?.neighbourhood}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-slate-800 block font-medium">
                          Renter: {renter?.name || b.renterId}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Host: {host?.name || b.ownerId}
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
                        <span className="text-[10px] text-purple-700 font-bold">
                          Fee: {b.fee.toLocaleString()} ETB
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Badge status={b.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/bookings/${b.id}`}
                          className="text-xs font-semibold text-emerald-600 hover:underline"
                        >
                          Audit Receipt &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
