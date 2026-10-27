"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCar } from "@/lib/data";
import { CarListingSchema } from "@/lib/validations";
import { RoleGuard } from "@/components/RoleGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Car,
  PlusCircle,
  MapPin,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewCarListingPage() {
  const router = useRouter();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(2022);
  const [transmission, setTransmission] = useState<"automatic" | "manual">("automatic");
  const [seats, setSeats] = useState<number>(5);
  const [neighbourhood, setNeighbourhood] = useState("Bole");
  const [pricePerDay, setPricePerDay] = useState<number>(4500);
  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80"
  );
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Default coordinate mapping for Addis Ababa neighbourhoods
  const neighbourhoodCoords: Record<string, { lat: number; lng: number }> = {
    Bole: { lat: 8.9952, lng: 38.7885 },
    Kazanchis: { lat: 9.0182, lng: 38.7715 },
    Sarbet: { lat: 8.9961, lng: 38.7368 },
    Piassa: { lat: 9.0345, lng: 38.7521 },
    CMC: { lat: 9.0254, lng: 38.8351 },
    "Old Airport": { lat: 8.9834, lng: 38.7302 },
    Megenagna: { lat: 9.0221, lng: 38.8024 },
    Mexico: { lat: 9.0102, lng: 38.7455 },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const coords = neighbourhoodCoords[neighbourhood] || { lat: 9.01, lng: 38.76 };

    // Zod Schema Validation
    const validation = CarListingSchema.safeParse({
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      transmission,
      seats: Number(seats),
      city: "Addis Ababa",
      neighbourhood,
      latitude: coords.lat,
      longitude: coords.lng,
      pricePerDay: Number(pricePerDay),
      photos: photoUrl.trim() ? [photoUrl.trim()] : [],
      description: description.trim(),
    });

    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errMap[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errMap);
      setError("Please fix the validation errors below.");
      return;
    }

    setSubmitting(true);

    const res = saveCar({
      ownerId: "", // will be injected by session in saveCar
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      transmission,
      seats: Number(seats),
      city: "Addis Ababa",
      neighbourhood,
      latitude: coords.lat,
      longitude: coords.lng,
      pricePerDay: Number(pricePerDay),
      photos: photoUrl.trim() ? [photoUrl.trim()] : [],
      description: description.trim(),
      unavailableDates: [],
    });

    if (!res.success) {
      setError(res.error || "Failed to create vehicle listing");
      setSubmitting(false);
      return;
    }

    alert(
      "Vehicle listing submitted! It has been placed in the Administrator Moderation queue and will be published once approved."
    );
    router.push("/owner/cars");
  };

  return (
    <RoleGuard requiredRole="owner">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Host Hub", href: "/owner" },
            { label: "Fleet", href: "/owner/cars" },
            { label: "List New Vehicle" },
          ]}
        />

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Vehicle Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              List Your Car on Sheggar Wheels
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Provide vehicle specifications, location in Addis Ababa, and daily rental price in ETB.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Make, Model, Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Make / Manufacturer
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota, Hyundai..."
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Model
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rav4, Tucson..."
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Manufacturing Year
                </label>
                <input
                  type="number"
                  required
                  min={2005}
                  max={2026}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Gearbox, Seats, Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Transmission
                </label>
                <Select value={transmission} onValueChange={(val: any) => setTransmission(val)}>
                  <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl text-xs">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Passenger Capacity (Seats)
                </label>
                <input
                  type="number"
                  required
                  min={2}
                  max={15}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Daily Rental Rate (ETB)
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  step={100}
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Location & Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Addis Ababa Neighbourhood
                </label>
                <Select value={neighbourhood} onValueChange={(val) => setNeighbourhood(val)}>
                  <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl text-xs">
                    <SelectValue placeholder="Select neighbourhood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bole">Bole</SelectItem>
                    <SelectItem value="Kazanchis">Kazanchis</SelectItem>
                    <SelectItem value="Sarbet">Sarbet</SelectItem>
                    <SelectItem value="Piassa">Piassa</SelectItem>
                    <SelectItem value="CMC">CMC</SelectItem>
                    <SelectItem value="Old Airport">Old Airport</SelectItem>
                    <SelectItem value="Megenagna">Megenagna</SelectItem>
                    <SelectItem value="Mexico">Mexico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Primary Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Vehicle Description & Guidelines
              </label>
              <textarea
                required
                rows={4}
                placeholder="Mention fuel efficiency, mileage conditions, Bluetooth/AC equipment, and any specific renter requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Moderation Notice */}
            <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Platform Moderation Policy:</strong>
                All newly created car listings are queued with <em>pending</em> status until approved by a platform administrator.
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2"
            >
              <span>Submit Listing for Moderation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </RoleGuard>
  );
}
