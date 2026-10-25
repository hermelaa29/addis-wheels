"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Car as CarType } from "@/types";
import { Badge } from "./Badge";
import { MapPin, Users, ShieldCheck, ArrowRight } from "lucide-react";

interface CarCardProps {
  car: CarType;
  showStatus?: boolean;
  priority?: boolean;
}

export function CarCard({ car, showStatus = false, priority = false }: CarCardProps) {
  const [imageError, setImageError] = useState(false);
  const rawPhoto = car.photos && car.photos.length > 0 ? car.photos[0] : "";
  // Optimize Unsplash image payload for mobile bandwidth (600px width, 70 quality, webp)
  const photo = rawPhoto
    ? rawPhoto.replace(/w=\d+/, "w=600").replace(/q=\d+/, "q=70")
    : "";

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Photo Container with fixed aspect ratio to eliminate Cumulative Layout Shift (CLS) */}
      <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {photo && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={`${car.year} ${car.make} ${car.model} rental in ${car.neighbourhood}, Addis Ababa`}
            width={480}
            height={300}
            decoding="async"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-4 text-center">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{car.make} {car.model}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vehicle Image</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
          <span className="bg-navy-950/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/10">
            {car.transmission}
          </span>
          {showStatus && car.status !== "approved" && (
            <Badge status={car.status} size="sm" />
          )}
        </div>

        {/* Top-Right Year Pill */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-slate-900 dark:text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            {car.year}
          </span>
        </div>

        {/* Bottom Floating Price Tag inside Image */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between z-10">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-white/20 dark:border-slate-700">
            <div className="text-[10px] uppercase font-extrabold text-slate-600 dark:text-slate-400 tracking-wider">Daily Rate</div>
            <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">
              {car.pricePerDay.toLocaleString()}{" "}
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">ETB/day</span>
            </div>
          </div>

          <div className="bg-navy-950/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm border border-white/10">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{car.neighbourhood}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {car.make} {car.model}
            </h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {car.description}
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 py-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="font-medium">{car.seats} Passengers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">Verified Host</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
          <Link
            href={`/cars/${car.id}`}
            aria-label={`View details and rental pricing for ${car.year} ${car.make} ${car.model} in ${car.neighbourhood}`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <span>View Vehicle Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
