"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getDisputes, getBookingById, getUserById, getCarById } from "@/lib/data";
import { useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export default function AdminDisputesPage() {
  const isMounted = useIsMounted();
  const [statusFilter, setStatusFilter] = useState("all");

  const allDisputes = useMemo(() => {
    if (!isMounted) return [];
    return getDisputes();
  }, [isMounted]);

  const filteredDisputes = useMemo(() => {
    if (statusFilter === "all") return allDisputes;
    return allDisputes.filter((d) => d.status === statusFilter);
  }, [allDisputes, statusFilter]);

  return (
    <RoleGuard requiredRole="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Dispute Tribunal" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Platform Dispute Resolution Tribunal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Arbitrate disputes between renters and vehicle hosts, review statements, and issue binding resolutions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="all">All Disputes ({allDisputes.length})</option>
              <option value="open">Open / Action Needed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Disputes List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredDisputes.length === 0 ? (
            <div className="text-center py-16 p-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No Disputes Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All platform claims have been addressed or no claims match your filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Dispute Ref & Date</th>
                    <th className="px-6 py-3.5">Booking / Vehicle</th>
                    <th className="px-6 py-3.5">Filed Reason</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Adjudication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDisputes.map((d) => {
                    const booking = getBookingById(d.bookingId);
                    const car = booking ? getCarById(booking.carId) : null;
                    return (
                      <tr key={d.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-slate-900 block">{d.id}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 block">
                            {car ? `${car.year} ${car.make} ${car.model}` : "Car"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Booking: {d.bookingId}
                          </span>
                        </td>

                        <td className="px-6 py-4 max-w-xs">
                          <span className="font-bold text-slate-800 block truncate">{d.reason}</span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {d.description}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <Badge status={d.status} />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/disputes/${d.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-sm transition"
                          >
                            <span>Resolve</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
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
