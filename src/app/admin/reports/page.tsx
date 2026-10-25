"use client";

import React, { useMemo } from "react";
import {
  getPlatformMetrics,
  getBookings,
  getCars,
  getUsers,
  getDisputes,
  generateCsv,
  downloadCsv,
  getCarById,
  getUserById,
} from "@/lib/data";
import { useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  BarChart2,
  Download,
  DollarSign,
  TrendingUp,
  Users,
  Car,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";

export default function AdminReportsPage() {
  const isMounted = useIsMounted();

  const metrics = useMemo(() => {
    if (!isMounted) return null;
    return getPlatformMetrics();
  }, [isMounted]);

  const bookings = useMemo(() => (isMounted ? getBookings() : []), [isMounted]);
  const users = useMemo(() => (isMounted ? getUsers() : []), [isMounted]);
  const disputes = useMemo(() => (isMounted ? getDisputes() : []), [isMounted]);

  // Export 1: Revenue & Commission Ledger
  const handleExportFinancialLedger = () => {
    const csv = generateCsv(bookings, [
      { key: "id", label: "Booking ID" },
      {
        key: "vehicle",
        label: "Vehicle",
        transform: (b) => {
          const c = getCarById(b.carId);
          return c ? `${c.year} ${c.make} ${c.model}` : b.carId;
        },
      },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "days", label: "Duration (Days)" },
      { key: "subtotal", label: "Trip Subtotal (ETB)" },
      {
        key: "hostPayout",
        label: "Host Net Payout 90% (ETB)",
        transform: (b) => Math.round(b.subtotal * 0.9),
      },
      { key: "fee", label: "Platform Commission 10% (ETB)" },
      { key: "total", label: "Gross Total (ETB)" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created At" },
    ]);
    downloadCsv(csv, `sheggar-wheels-financial-ledger-${new Date().toISOString().split("T")[0]}.csv`);
  };

  // Export 2: User Census
  const handleExportUserCensus = () => {
    const csv = generateCsv(users, [
      { key: "id", label: "User ID" },
      { key: "name", label: "Full Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      {
        key: "roles",
        label: "Roles",
        transform: (u) => u.roles.join("; "),
      },
      { key: "status", label: "Account Status" },
      { key: "createdAt", label: "Registration Date" },
    ]);
    downloadCsv(csv, `sheggar-wheels-user-census-${new Date().toISOString().split("T")[0]}.csv`);
  };

  // Export 3: Disputes Ledger
  const handleExportDisputes = () => {
    const csv = generateCsv(disputes, [
      { key: "id", label: "Dispute ID" },
      { key: "bookingId", label: "Booking ID" },
      { key: "openedBy", label: "Opened By User ID" },
      { key: "reason", label: "Reason" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },
      { key: "resolutionNotes", label: "Resolution Notes" },
      { key: "resolvedBy", label: "Resolved By Admin ID" },
      { key: "resolvedAt", label: "Resolved Timestamp" },
      { key: "createdAt", label: "Created Timestamp" },
    ]);
    downloadCsv(csv, `sheggar-wheels-disputes-audit-${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Platform Reports" },
          ]}
        />

        <div className="mb-8">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
            Executive Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Analytics & Regulatory Exports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download RFC 4180 compliant CSV exports and audit platform financial performance in Addis Ababa.
          </p>
        </div>

        {/* 3 Export Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Financial & Commission Ledger</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Itemized breakdown of trip gross fares, host 90% payouts, and platform 10% commission revenues.
              </p>
            </div>
            <button
              onClick={handleExportFinancialLedger}
              className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download Financial CSV
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Platform User Census</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Comprehensive directory of registered renters, car hosts, and administrators with status flags.
              </p>
            </div>
            <button
              onClick={handleExportUserCensus}
              className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download User Census CSV
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Disputes & Adjudication Ledger</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Official tribunal records of all filed claims, admin findings, and resolution timestamps.
              </p>
            </div>
            <button
              onClick={handleExportDisputes}
              className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download Disputes CSV
            </button>
          </div>
        </div>

        {/* Aggregate KPI Summary Table */}
        {metrics && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Platform Performance Summary Table</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact aggregations computed dynamically from demo storage records.
              </p>
            </div>

            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Gross Marketplace Volume
                  </dt>
                  <dd className="text-xl font-black text-slate-900 mt-1">
                    {metrics.totalRevenue.toLocaleString()} ETB
                  </dd>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Net Platform Commission (10%)
                  </dt>
                  <dd className="text-xl font-black text-purple-700 mt-1">
                    {metrics.platformCommission.toLocaleString()} ETB
                  </dd>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Host Payouts Distributed (90%)
                  </dt>
                  <dd className="text-xl font-black text-emerald-700 mt-1">
                    {(metrics.totalRevenue - metrics.platformCommission).toLocaleString()} ETB
                  </dd>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Fulfilled Trip Volume
                  </dt>
                  <dd className="text-xl font-black text-slate-900 mt-1">
                    {metrics.completedBookings} / {metrics.totalBookings} Completed
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
