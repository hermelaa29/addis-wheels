"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCarById, getBookings, transitionBooking } from "@/lib/data";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Car, CheckCircle, XCircle, ShieldAlert, ArrowRight, Layers } from "lucide-react";

export default function CarSpecificBookingsPage() {
  const params = useParams();
  const isMounted = useIsMounted();
  const { session } = useSession();

  const carId = params?.id as string;
  const car = useMemo(() => (isMounted ? getCarById(carId) : null), [isMounted, carId]);
  const carBookings = useMemo(() => (isMounted ? getBookings({ carId }) : []), [isMounted, carId]);

  if (!isMounted) return null;

  if (!car) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-1">Car Not Found</h2>
        <Link href="/owner/cars" className="text-xs font-bold text-emerald-600 underline">
          Back to Fleet
        </Link>
      </div>
    );
  }

  // Ownership Guard
  const isOwner = session && (car.ownerId === session.user.id || session.user.roles.includes("admin"));
  if (!isOwner) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-rose-50 rounded-3xl border border-rose-200 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-rose-900 mb-1">Forbidden</h2>
        <p className="text-xs text-rose-700 mb-4">
          You do not own this vehicle.
        </p>
        <Link href="/owner/cars" className="text-xs font-bold text-slate-800 underline">
          Return to Fleet
        </Link>
      </div>
    );
  }

  const handleApprove = (bookingId: string) => {
    const res = transitionBooking(bookingId, "confirmed");
    if (!res.success) alert(res.error);
  };

  const handleDecline = (bookingId: string) => {
    if (confirm("Decline this request?")) {
      const res = transitionBooking(bookingId, "declined", { reason: "Declined by host" });
      if (!res.success) alert(res.error);
    }
  };

  return (
    <RoleGuard requiredRole="owner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Host Hub", href: "/owner" },
            { label: "Fleet", href: "/owner/cars" },
            { label: `${car.make} ${car.model} Bookings` },
          ]}
        />

        <div className="mb-6">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Vehicle Bookings History
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Bookings for {car.year} {car.make} {car.model}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing all historical and active reservations for this vehicle listing ({carBookings.length} total).
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {carBookings.length === 0 ? (
            <div className="text-center py-16 p-6">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No Bookings Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No renters have booked this vehicle yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Ref ID</th>
                    <th className="px-6 py-3.5">Dates</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Gross / Net Payout</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {carBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{b.startDate} to {b.endDate}</td>
                      <td className="px-6 py-4">{b.days} days</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">
                          {Math.round(b.subtotal * 0.9).toLocaleString()} ETB (Net)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Gross: {b.total.toLocaleString()} ETB
                        </span>
                      </td>
                      <td className="px-6 py-4"><Badge status={b.status} /></td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        {b.status === "requested" && (
                          <>
                            <button
                              onClick={() => handleApprove(b.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecline(b.id)}
                              className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded text-xs font-semibold"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        <Link
                          href={`/bookings/${b.id}`}
                          className="text-xs font-semibold text-emerald-600 hover:underline"
                        >
                          View Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
