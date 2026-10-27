"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getCars, moderateCar, getUserById } from "@/lib/data";
import { useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Car, CheckCircle, XCircle, Search, Filter, ExternalLink, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminListingsPage() {
  const isMounted = useIsMounted();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const allCars = useMemo(() => {
    if (!isMounted) return [];
    return getCars({ status: "all" });
  }, [isMounted]);

  const filteredCars = useMemo(() => {
    return allCars.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const full = `${c.make} ${c.model} ${c.neighbourhood}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });
  }, [allCars, statusFilter, searchTerm]);

  const handleApprove = (carId: string) => {
    const res = moderateCar(carId, "approved");
    if (!res.success) alert(res.error);
  };

  const handleReject = (carId: string) => {
    if (confirm("Reject this listing? It will not appear in the public car search.")) {
      const res = moderateCar(carId, "rejected");
      if (!res.success) alert(res.error);
    }
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Listings Moderation" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Vehicle Listings Moderation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Approve, reject, or inspect all vehicle listings registered across Addis Ababa.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search make, model, neighbourhood..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="h-9 w-full sm:w-52 bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses ({allCars.length})</SelectItem>
                <SelectItem value="pending">Pending Moderation</SelectItem>
                <SelectItem value="approved">Approved & Public</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredCars.length === 0 ? (
            <div className="text-center py-16 p-6">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No Listings Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No vehicles matched your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Car & Year</th>
                    <th className="px-6 py-3.5">Host</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Rate</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Moderator Decisions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCars.map((c) => {
                    const host = getUserById(c.ownerId);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">
                            {c.year} {c.make} {c.model}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.id}</span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-800 block">{host?.name || c.ownerId}</span>
                          <span className="text-[10px] text-slate-400">{host?.email}</span>
                        </td>

                        <td className="px-6 py-4">
                          <span>{c.neighbourhood}, Addis Ababa</span>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          {c.pricePerDay.toLocaleString()} ETB/day
                        </td>

                        <td className="px-6 py-4">
                          <Badge status={c.status} />
                        </td>

                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          {c.status !== "approved" && (
                            <button
                              onClick={() => handleApprove(c.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                            >
                              Approve
                            </button>
                          )}
                          {c.status !== "rejected" && (
                            <button
                              onClick={() => handleReject(c.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition"
                            >
                              Reject
                            </button>
                          )}
                          <Link
                            href={`/cars/${c.id}`}
                            aria-label={`Preview details for ${c.make} ${c.model}`}
                            className="inline-block p-1 text-slate-400 hover:text-slate-800 transition"
                            title="Preview car details page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
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
