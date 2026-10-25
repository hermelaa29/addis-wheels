"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getUserById,
  updateUserStatus,
  getCars,
  getBookings,
  getCarById,
} from "@/lib/data";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Car,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isMounted = useIsMounted();
  const { session } = useSession();

  const userId = params?.id as string;
  const user = useMemo(() => (isMounted ? getUserById(userId) : null), [isMounted, userId]);

  const userCars = useMemo(() => {
    if (!isMounted || !userId) return [];
    return getCars({ status: "all" }).filter((c) => c.ownerId === userId);
  }, [isMounted, userId]);

  const userBookings = useMemo(() => {
    if (!isMounted || !userId) return [];
    return getBookings({ renterId: userId });
  }, [isMounted, userId]);

  if (!isMounted) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-1">User Not Found</h2>
        <Link href="/admin/users" className="text-xs font-bold text-emerald-600 underline">
          Return to User Directory
        </Link>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    if (confirm(`Change status of ${user.name} to "${nextStatus}"?`)) {
      const res = updateUserStatus(user.id, nextStatus);
      if (!res.success) alert(res.error);
      else router.refresh();
    }
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/admin/users" },
            { label: user.name },
          ]}
        />

        {/* User Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-navy-900 text-emerald-400 flex items-center justify-center font-bold text-xl uppercase shadow-md">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                  <Badge status={user.status} size="md" />
                </div>
                <p className="text-xs text-slate-400 font-mono">User ID: {user.id}</p>
              </div>
            </div>

            {session?.user.id !== user.id && (
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  user.status === "active"
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                }`}
              >
                {user.status === "active" ? "Suspend Account" : "Reinstate Account"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                <span className="font-semibold text-slate-800">{user.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Created</span>
                <span className="font-semibold text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* If Host: Registered Vehicles */}
        {userCars.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" /> Host Vehicles ({userCars.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Vehicle</th>
                    <th className="px-6 py-3">Neighbourhood</th>
                    <th className="px-6 py-3">Rate</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userCars.map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-3 font-bold text-slate-900">{c.year} {c.make} {c.model}</td>
                      <td className="px-6 py-3">{c.neighbourhood}</td>
                      <td className="px-6 py-3 font-mono">{c.pricePerDay.toLocaleString()} ETB</td>
                      <td className="px-6 py-3"><Badge status={c.status} /></td>
                      <td className="px-6 py-3 text-right">
                        <Link href={`/cars/${c.id}`} className="text-emerald-600 font-bold hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* If Renter: Booking History */}
        {userBookings.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" /> Renter Booking History ({userBookings.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Booking ID</th>
                    <th className="px-6 py-3">Vehicle</th>
                    <th className="px-6 py-3">Dates</th>
                    <th className="px-6 py-3">Total Paid</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userBookings.map((b) => {
                    const car = getCarById(b.carId);
                    return (
                      <tr key={b.id}>
                        <td className="px-6 py-3 font-mono font-bold text-slate-900">{b.id}</td>
                        <td className="px-6 py-3">{car ? `${car.make} ${car.model}` : b.carId}</td>
                        <td className="px-6 py-3">{b.startDate} to {b.endDate}</td>
                        <td className="px-6 py-3 font-mono font-bold">{b.total.toLocaleString()} ETB</td>
                        <td className="px-6 py-3"><Badge status={b.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
