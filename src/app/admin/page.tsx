"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession, useIsMounted } from "@/lib/useStorage";
import {
  getPlatformMetrics,
  getCars,
  getBookings,
  getUsers,
  getDisputes,
  moderateCar,
} from "@/lib/data";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  ShieldCheck,
  Users,
  Car,
  Calendar,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Megaphone,
  FileText,
  ArrowRight,
  BarChart2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const isMounted = useIsMounted();
  const { session } = useSession();

  const metrics = useMemo(() => {
    if (!isMounted) return null;
    return getPlatformMetrics();
  }, [isMounted]);

  const pendingCars = useMemo(() => {
    if (!isMounted) return [];
    return getCars({ status: "pending" });
  }, [isMounted]);

  const openDisputes = useMemo(() => {
    if (!isMounted) return [];
    return getDisputes().filter((d) => d.status === "open");
  }, [isMounted]);

  const handleApproveCar = (carId: string) => {
    const res = moderateCar(carId, "approved");
    if (!res.success) alert(res.error);
    else alert("Vehicle approved and published to public search catalogue!");
  };

  const handleRejectCar = (carId: string) => {
    if (confirm("Reject this listing? It will not appear in public search.")) {
      const res = moderateCar(carId, "rejected");
      if (!res.success) alert(res.error);
    }
  };

  // Monthly platform booking volume
  const monthlyMetrics = [
    { month: "Jan 2026", bookings: 12, revenue: 84000, commission: 8400 },
    { month: "Feb 2026", bookings: 18, revenue: 132000, commission: 13200 },
    { month: "Mar 2026", bookings: 25, revenue: 195000, commission: 19500 },
    {
      month: "Apr 2026",
      bookings: metrics?.totalBookings || 30,
      revenue: metrics?.totalRevenue || 220000,
      commission: metrics?.platformCommission || 22000,
    },
  ];

  return (
    <RoleGuard requiredRole="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs items={[{ label: "Admin Console" }]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Platform Governance Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sheggar Wheels Administration
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live monitoring of marketplace volume, car moderation, disputes, and commission revenues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/listings"
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Moderation Queue ({pendingCars.length})
            </Link>
            <Link
              href="/admin/reports"
              className="px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Analytics & Reports
            </Link>
          </div>
        </div>

        {/* Key Metrics Row */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Users
                </span>
                <Users className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics.totalUsers}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {metrics.activeUsers} active, {metrics.suspendedUsers} suspended
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Fleet Listings
                </span>
                <Car className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics.totalCars}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {metrics.approvedCars} approved, {metrics.pendingCars} pending
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Platform Commission
                </span>
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {metrics.platformCommission.toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-500">ETB</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                10% fee on completed rentals
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Open Disputes
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600">{metrics.openDisputes}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Require admin intervention
              </span>
            </div>
          </div>
        )}

        {/* Priority Moderation Section */}
        {pendingCars.length > 0 && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-600" /> Listings Awaiting Admin Moderation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vehicles pending approval do not appear in public search results.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                {pendingCars.length} Action Needed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Car & Year</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Rate (ETB/day)</th>
                    <th className="px-6 py-3.5">Submitted On</th>
                    <th className="px-6 py-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingCars.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {c.year} {c.make} {c.model}
                      </td>
                      <td className="px-6 py-4">{c.neighbourhood}, Addis Ababa</td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600">
                        {c.pricePerDay.toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleApproveCar(c.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve & Publish
                        </button>
                        <button
                          onClick={() => handleRejectCar(c.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Platform Volume Chart & Accessible Data Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-600" /> Platform Booking Volume
              </h3>
              <span className="text-xs text-slate-400">Past 4 Months</span>
            </div>

            <div className="space-y-4 pt-2">
              {monthlyMetrics.map((m) => {
                const maxBookings = 35;
                const pct = Math.min(100, Math.round((m.bookings / maxBookings) * 100));
                return (
                  <div key={m.month} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">{m.month}</span>
                      <span className="font-mono text-purple-700 font-bold">
                        {m.bookings} bookings • {m.commission.toLocaleString()} ETB comm.
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              Platform revenue is derived directly from the 10% fee on fulfilled reservations.
            </p>
          </div>

          {/* Accessible Table Alternative */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Booking Metrics (Screen Reader Accessible Table)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Period</th>
                    <th className="px-4 py-2.5">Bookings</th>
                    <th className="px-4 py-2.5">Gross Revenue</th>
                    <th className="px-4 py-2.5 text-right">Commission (10%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyMetrics.map((d) => (
                    <tr key={d.month}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{d.month}</td>
                      <td className="px-4 py-3">{d.bookings}</td>
                      <td className="px-4 py-3 font-mono">{d.revenue.toLocaleString()} ETB</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-700">
                        {d.commission.toLocaleString()} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400">
              Meets WCAG 2.1 accessibility criteria for non-text chart representations.
            </p>
          </div>
        </div>

        {/* Quick Admin Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition text-slate-800"
          >
            <Users className="w-6 h-6 text-sky-600 mb-2" />
            <h4 className="font-bold text-sm">User Directory</h4>
            <p className="text-xs text-slate-500 mt-1">Suspend or reinstate renter and host accounts.</p>
          </Link>

          <Link
            href="/admin/bookings"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition text-slate-800"
          >
            <Calendar className="w-6 h-6 text-emerald-600 mb-2" />
            <h4 className="font-bold text-sm">Platform Bookings</h4>
            <p className="text-xs text-slate-500 mt-1">Audit all active and historical rentals.</p>
          </Link>

          <Link
            href="/admin/disputes"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition text-slate-800"
          >
            <AlertTriangle className="w-6 h-6 text-rose-600 mb-2" />
            <h4 className="font-bold text-sm">Dispute Tribunal ({openDisputes.length})</h4>
            <p className="text-xs text-slate-500 mt-1">Review evidence and issue binding resolutions.</p>
          </Link>

          <Link
            href="/admin/announcements"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition text-slate-800"
          >
            <Megaphone className="w-6 h-6 text-amber-500 mb-2" />
            <h4 className="font-bold text-sm">Announcements</h4>
            <p className="text-xs text-slate-500 mt-1">Broadcast system notices to users.</p>
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}
