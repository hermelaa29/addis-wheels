"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCarById, updateCarAvailability } from "@/lib/data";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Car,
  ShieldAlert,
} from "lucide-react";

export default function CarAvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  const isMounted = useIsMounted();
  const { session } = useSession();

  const carId = params?.id as string;
  const car = useMemo(() => (isMounted ? getCarById(carId) : null), [isMounted, carId]);

  const [dateInput, setDateInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isMounted) return null;

  if (!car) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-1">Car Not Found</h2>
        <Link href="/owner/cars" className="text-xs font-bold text-emerald-600 underline">
          Return to Fleet
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
          You do not have permission to manage availability for this vehicle.
        </p>
        <Link href="/owner/cars" className="text-xs font-bold text-slate-800 underline">
          Back to Fleet
        </Link>
      </div>
    );
  }

  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!dateInput) return;
    if (car.unavailableDates.includes(dateInput)) {
      setError("This date is already marked unavailable.");
      return;
    }

    const updated = [...car.unavailableDates, dateInput].sort();
    const res = updateCarAvailability(car.id, updated);
    if (!res.success) {
      setError(res.error || "Failed to update availability");
    } else {
      setSuccess("Date blocked successfully!");
      setDateInput("");
    }
  };

  const handleRemoveBlockedDate = (dateToRemove: string) => {
    setError("");
    setSuccess("");
    const updated = car.unavailableDates.filter((d) => d !== dateToRemove);
    const res = updateCarAvailability(car.id, updated);
    if (!res.success) {
      setError(res.error || "Failed to update availability");
    } else {
      setSuccess("Date unblocked!");
    }
  };

  return (
    <RoleGuard requiredRole="owner">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Host Hub", href: "/owner" },
            { label: "Fleet", href: "/owner/cars" },
            { label: `Availability: ${car.make} ${car.model}` },
          ]}
        />

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Calendar Management
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Block Unavailable Dates
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {car.year} {car.make} {car.model} • Block personal use or maintenance days so renters cannot book them.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Add Date Form */}
          <form onSubmit={handleAddBlockedDate} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Select Date to Block
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Block Date
            </button>
          </form>

          {/* Blocked Dates List */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Currently Blocked Dates ({car.unavailableDates?.length || 0})
            </h3>

            {!car.unavailableDates || car.unavailableDates.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
                No dates are currently blocked. Your vehicle is open for all upcoming calendar dates!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {car.unavailableDates.map((d) => (
                  <div
                    key={d}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <span className="font-mono font-bold text-slate-800">{d}</span>
                    <button
                      onClick={() => handleRemoveBlockedDate(d)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Unblock this date"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
