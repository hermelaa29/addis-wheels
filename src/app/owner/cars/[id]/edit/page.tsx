"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCarById, saveCar } from "@/lib/data";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Car, AlertCircle, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditCarListingPage() {
  const params = useParams();
  const router = useRouter();
  const isMounted = useIsMounted();
  const { session } = useSession();

  const carId = params?.id as string;
  const car = useMemo(() => (isMounted ? getCarById(carId) : null), [isMounted, carId]);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(2022);
  const [transmission, setTransmission] = useState<"automatic" | "manual">("automatic");
  const [seats, setSeats] = useState<number>(5);
  const [neighbourhood, setNeighbourhood] = useState("Bole");
  const [pricePerDay, setPricePerDay] = useState<number>(4500);
  const [photoUrl, setPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (car) {
      setMake(car.make);
      setModel(car.model);
      setYear(car.year);
      setTransmission(car.transmission);
      setSeats(car.seats);
      setNeighbourhood(car.neighbourhood);
      setPricePerDay(car.pricePerDay);
      setPhotoUrl(car.photos && car.photos.length > 0 ? car.photos[0] : "");
      setDescription(car.description);
    }
  }, [car]);

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
        <h2 className="text-lg font-bold text-rose-900 mb-1">Forbidden Operation</h2>
        <p className="text-xs text-rose-700 mb-4">
          You do not own this vehicle and cannot edit its parameters.
        </p>
        <Link href="/owner/cars" className="text-xs font-bold text-slate-800 underline">
          Return to Your Vehicles
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = saveCar({
      id: car.id,
      ownerId: car.ownerId,
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      transmission,
      seats: Number(seats),
      city: car.city,
      neighbourhood,
      latitude: car.latitude,
      longitude: car.longitude,
      pricePerDay: Number(pricePerDay),
      photos: photoUrl.trim() ? [photoUrl.trim()] : car.photos,
      description: description.trim(),
      unavailableDates: car.unavailableDates || [],
    });

    if (!res.success) {
      setError(res.error || "Failed to update vehicle");
      setSubmitting(false);
      return;
    }

    alert("Vehicle listing updated! Changes have been submitted for re-moderation.");
    router.push("/owner/cars");
  };

  return (
    <RoleGuard requiredRole="owner">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Host Hub", href: "/owner" },
            { label: "Fleet", href: "/owner/cars" },
            { label: `Edit ${car.make} ${car.model}` },
          ]}
        />

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Listing Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Edit {car.year} {car.make} {car.model}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Modify rates, description, seats, or primary photography.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Make</label>
                <input
                  type="text"
                  required
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Year</label>
                <input
                  type="number"
                  required
                  min={2005}
                  max={2026}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Transmission</label>
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
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Seats</label>
                <input
                  type="number"
                  required
                  min={2}
                  max={15}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Daily Rate (ETB)</label>
                <input
                  type="number"
                  required
                  min={500}
                  step={100}
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Neighbourhood</label>
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
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Photo URL</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2"
            >
              <span>Save & Submit Changes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </RoleGuard>
  );
}
