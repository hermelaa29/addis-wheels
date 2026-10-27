"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBookingById, getCarById, getBookingSlug } from "@/lib/data";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { useLiveTelemetrySWR } from "@/lib/useSWRData";
import { RoleGuard } from "@/components/RoleGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeafletMap } from "@/components/LeafletMap";
import { Badge } from "@/components/Badge";
import {
  Compass,
  MapPin,
  Clock,
  Car,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Navigation,
  Zap,
  Gauge,
} from "lucide-react";

export default function TrackingSimulationPage() {
  const params = useParams();
  const isMounted = useIsMounted();
  const { session } = useSession();

  const bookingId = params?.id as string;
  const booking = useMemo(() => (isMounted ? getBookingById(bookingId) : null), [isMounted, bookingId]);
  const car = useMemo(() => (booking ? getCarById(booking.carId) : null), [booking]);

  // SWR Live Telemetry Polling (polls every 3.5s)
  const { telemetry } = useLiveTelemetrySWR(bookingId, true);

  // Pre-calculated simulated route across central Addis Ababa
  // Route: Bole Airport/Medhanialem -> Meskel Square -> Kazanchis -> Arat Kilo
  const simulatedRoute: [number, number][] = [
    [8.9952, 38.7885], // Bole
    [9.0040, 38.7750], // Olympia / Wollo Sefer
    [9.0102, 38.7610], // Meskel Square
    [9.0182, 38.7715], // UNECA Kazanchis
    [9.0280, 38.7620], // Arat Kilo
  ];

  if (!isMounted) return null;

  if (!booking || !car) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-1">Booking Not Found</h2>
        <Link href="/dashboard" className="text-xs font-bold text-emerald-600 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="renter">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Bookings", href: "/bookings" },
            { label: `Booking #${booking.id}`, href: `/bookings/${getBookingSlug(booking, car)}` },
            { label: "Simulated Vehicle Tracking" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                Simulated Telemetry Feed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Vehicle Route Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {car.year} {car.make} {car.model} • Rental Period: {booking.startDate} to {booking.endDate}
            </p>
          </div>

          <Badge status={booking.status} size="md" />
        </div>

        {/* Clear Prototype GPS Disclaimer Box */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block font-bold">Simulated Demonstration Notice:</strong>
            This map displays a pre-calculated route corridor through Addis Ababa for user testing and demonstration purposes. No real hardware GPS tracker or live onboard telematics device is connected.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map display */}
          <div className="lg:col-span-2 space-y-4">
            <LeafletMap
              center={[telemetry?.latitude || 9.0102, telemetry?.longitude || 38.7610]}
              zoom={13}
              routePolyline={simulatedRoute}
              markers={[
                {
                  id: "start",
                  lat: 8.9952,
                  lng: 38.7885,
                  title: "Pickup Point: Bole Hub",
                  subtitle: "Scheduled Handover Location",
                },
                {
                  id: "current",
                  lat: telemetry?.latitude || 9.0182,
                  lng: telemetry?.longitude || 38.7715,
                  title: `Live Position: ${telemetry?.locationName || "Kazanchis"}`,
                  subtitle: `Speed: ${telemetry?.speedKmh || 42} km/h • Fuel: ${telemetry?.batteryFuelPercent || 78}%`,
                },
              ]}
              height="440px"
              fallbackAddress={`${car.neighbourhood}, Addis Ababa, Ethiopia`}
            />

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 shadow-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Live SWR Polling (3.5s): {telemetry?.latitude?.toFixed(4)}° N, {telemetry?.longitude?.toFixed(4)}° E
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-slate-400" /> {telemetry?.speedKmh || 40} km/h
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-500" /> {telemetry?.batteryFuelPercent || 80}% Fuel
                </span>
                <span className="text-slate-400">Ping: {telemetry?.lastPing || "Active"}</span>
              </div>
            </div>
          </div>

          {/* Route Checkpoints & Vehicle Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600" /> Route Waypoints
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Bole Medhanialem</strong>
                    <span className="text-slate-400 text-[11px]">Trip Start Checkpoint</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Meskel Square Interchange</strong>
                    <span className="text-slate-400 text-[11px]">Central City Hub</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Kazanchis / UNECA</strong>
                    <span className="text-emerald-600 font-semibold text-[11px]">Simulated Current Location</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <strong className="text-slate-700 block">Arat Kilo</strong>
                    <span className="text-slate-400 text-[11px]">Return Drop-off Target</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-slate-900">Emergency & Host Support</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Need roadside assistance or need to notify the host of an altered schedule? Contact support or phone the host directly.
              </p>
              <div className="pt-2">
                <Link
                  href={`/bookings/${getBookingSlug(booking, car)}`}
                  className="inline-block text-xs font-bold text-emerald-600 hover:underline"
                >
                  &larr; Return to Trip Receipt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
