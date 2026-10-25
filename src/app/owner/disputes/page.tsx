"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { getDisputes, getBookings, getCarById, getBookingById } from "@/lib/data";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AlertCircle, ShieldAlert, CheckCircle2, Car, Clock } from "lucide-react";

export default function OwnerDisputesPage() {
  const isMounted = useIsMounted();
  const { session } = useSession();

  const ownerId = session?.user.id;

  // Find bookings belonging to this owner
  const myBookingIds = useMemo(() => {
    if (!isMounted || !ownerId) return [];
    return getBookings({ ownerId }).map((b) => b.id);
  }, [isMounted, ownerId]);

  // Disputes on this owner's bookings
  const myDisputes = useMemo(() => {
    if (!isMounted || myBookingIds.length === 0) return [];
    return getDisputes().filter((d) => myBookingIds.includes(d.bookingId));
  }, [isMounted, myBookingIds]);

  return (
    <RoleGuard requiredRole="owner">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Host Hub", href: "/owner" },
            { label: "Disputes" },
          ]}
        />

        <div className="mb-6">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Resolution Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Trip Disputes & Claims
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Inspect renter claims regarding mechanical issues, cleanliness, or cancellations.
          </p>
        </div>

        {myDisputes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Clean Record: No Disputes</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no active disputes or claims on your bookings. Keep up the high service standards!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myDisputes.map((d) => {
              const booking = getBookingById(d.bookingId);
              const car = booking ? getCarById(booking.carId) : null;
              return (
                <div
                  key={d.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        Dispute #{d.id}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        Booking Ref: <strong className="font-mono">{d.bookingId}</strong>
                      </span>
                    </div>
                    <Badge status={d.status} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      Reason: {d.reason}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      {d.description}
                    </p>
                  </div>

                  {d.resolutionNotes && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs">
                      <strong className="text-emerald-900 block mb-1">
                        Administrator Resolution Decision:
                      </strong>
                      <p className="text-emerald-800">{d.resolutionNotes}</p>
                      <span className="text-[10px] text-emerald-600 block mt-1">
                        Resolved on {d.resolvedAt ? new Date(d.resolvedAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Vehicle: {car ? `${car.year} ${car.make} ${car.model}` : "Car"}
                    </span>
                    <Link
                      href={`/bookings/${d.bookingId}`}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      View Trip Details &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
