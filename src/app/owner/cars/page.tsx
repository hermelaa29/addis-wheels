"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { getCars } from "@/lib/data";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Car,
  PlusCircle,
  Calendar,
  Edit,
  ExternalLink,
  MapPin,
  Clock,
  Layers,
} from "lucide-react";

export default function OwnerCarsPage() {
  const isMounted = useIsMounted();
  const { session } = useSession();

  const myCars = useMemo(() => {
    if (!isMounted || !session) return [];
    return getCars({ status: "all" }).filter((c) => c.ownerId === session.user.id);
  }, [isMounted, session]);

  return (
    <RoleGuard requiredRole="owner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Host Hub", href: "/owner" },
            { label: "My Vehicle Fleet" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Vehicle Listings ({myCars.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage vehicle status, pricing, blocked calendar dates, and individual booking requests.
            </p>
          </div>

          <Link
            href="/owner/cars/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" /> + List New Car
          </Link>
        </div>

        {myCars.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Cars Listed Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              You haven&apos;t added any vehicles to your hosting portfolio. Start earning today by listing your first car.
            </p>
            <Link
              href="/owner/cars/new"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
            >
              List Your Car Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {car.photos && car.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={car.photos[0]}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No Image Available
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <Badge status={car.status} size="sm" />
                      <span className="bg-navy-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {car.transmission}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-base text-slate-900">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {car.pricePerDay.toLocaleString()} ETB/day
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{car.neighbourhood}, Addis Ababa</span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {car.description}
                    </p>

                    {car.unavailableDates && car.unavailableDates.length > 0 && (
                      <div className="mt-3 p-2 bg-amber-50 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{car.unavailableDates.length} calendar date(s) blocked</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/owner/cars/${car.id}/edit`}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-emerald-600 hover:border-emerald-300 transition"
                      title="Edit vehicle details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/owner/cars/${car.id}/availability`}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-emerald-600 hover:border-emerald-300 transition"
                      title="Manage blocked dates"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/owner/cars/${car.id}/bookings`}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-emerald-600 hover:border-emerald-300 transition"
                      title="View bookings on this car"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <Link
                    href={`/cars/${car.id}`}
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold text-xs"
                  >
                    <span>Public View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
