"use client";

import React, { useMemo } from "react";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { getCars, getBookings, getCarById, generateCsv, downloadCsv } from "@/lib/data";
import { RoleGuard } from "@/components/RoleGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  Car,
  PieChart,
  ShieldCheck,
} from "lucide-react";

export default function OwnerEarningsPage() {
  const isMounted = useIsMounted();
  const { session } = useSession();

  const ownerId = session?.user.id;

  const myCars = useMemo(() => {
    if (!isMounted || !ownerId) return [];
    return getCars({ status: "all" }).filter((c) => c.ownerId === ownerId);
  }, [isMounted, ownerId]);

  const myBookings = useMemo(() => {
    if (!isMounted || !ownerId) return [];
    return getBookings({ ownerId });
  }, [isMounted, ownerId]);

  const completedBookings = myBookings.filter((b) => b.status === "completed");

  // Host net earnings: 90% of subtotal
  const totalNetEarnings = completedBookings.reduce(
    (acc, b) => acc + Math.round(b.subtotal * 0.9),
    0
  );
  const totalPlatformFees = completedBookings.reduce((acc, b) => acc + b.fee, 0);
  const totalGrossRevenue = completedBookings.reduce((acc, b) => acc + b.total, 0);

  // Per-car earnings breakdown
  const perCarEarnings = useMemo(() => {
    return myCars.map((car) => {
      const carBookings = completedBookings.filter((b) => b.carId === car.id);
      const earned = carBookings.reduce((acc, b) => acc + Math.round(b.subtotal * 0.9), 0);
      const days = carBookings.reduce((acc, b) => acc + b.days, 0);
      return {
        car,
        completedCount: carBookings.length,
        bookedDays: days,
        netEarned: earned,
      };
    });
  }, [myCars, completedBookings]);

  const handleExportCsv = () => {
    if (completedBookings.length === 0) return;
    const csv = generateCsv(completedBookings, [
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
      { key: "days", label: "Rental Days" },
      { key: "subtotal", label: "Trip Subtotal (ETB)" },
      {
        key: "netPayout",
        label: "Host Net Payout (90%)",
        transform: (b) => Math.round(b.subtotal * 0.9),
      },
      { key: "fee", label: "Platform Fee (10%)" },
      { key: "transactionRef", label: "Payment Reference" },
      { key: "createdAt", label: "Booking Date" },
    ]);
    downloadCsv(csv, `sheggar-wheels-host-earnings-${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <RoleGuard requiredRole="owner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Host Hub", href: "/owner" },
            { label: "Host Earnings" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Host Earnings & Financial Summary
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Transparent commission breakdown and per-vehicle revenue tracking across Addis Ababa.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={completedBookings.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" /> Export Earnings CSV
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Net Host Payout
            </span>
            <div className="text-3xl font-black text-emerald-600">
              {totalNetEarnings.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">ETB</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 block">
              90% share of completed rental subtotals
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Gross Rental Revenue
            </span>
            <div className="text-3xl font-black text-slate-900">
              {totalGrossRevenue.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">ETB</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 block">
              Total renter expenditure across your fleet
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Platform Service Fees
            </span>
            <div className="text-3xl font-black text-slate-600">
              {totalPlatformFees.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">ETB</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 block">
              Standard 10% platform commission
            </span>
          </div>
        </div>

        {/* Commission Policy Notice */}
        <div className="mb-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block font-bold">Commission Model:</strong>
            Sheggar Wheels charges a flat 10% platform commission on the rental subtotal. The vehicle host receives exactly <strong>90% of the rental fee</strong>. Payouts are credited upon trip completion.
          </div>
        </div>

        {/* Per-Car Breakdown Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Per-Vehicle Performance</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of trips and cumulative revenue by vehicle.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Neighbourhood</th>
                  <th className="px-6 py-3.5">Daily Rate</th>
                  <th className="px-6 py-3.5">Completed Trips</th>
                  <th className="px-6 py-3.5">Total Days</th>
                  <th className="px-6 py-3.5 text-right">Net Earned (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {perCarEarnings.map((item) => (
                  <tr key={item.car.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.car.year} {item.car.make} {item.car.model}
                    </td>
                    <td className="px-6 py-4">{item.car.neighbourhood}</td>
                    <td className="px-6 py-4 font-mono">{item.car.pricePerDay.toLocaleString()} ETB</td>
                    <td className="px-6 py-4">{item.completedCount} rentals</td>
                    <td className="px-6 py-4">{item.bookedDays} days</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">
                      {item.netEarned.toLocaleString()} ETB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
